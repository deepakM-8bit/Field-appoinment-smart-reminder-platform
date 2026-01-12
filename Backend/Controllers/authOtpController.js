import pool from "../db.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

/* -------------------- Helpers -------------------- */
const OTP_EXP_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const MAX_OTP_REQUESTS_15_MIN = 3;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString(); // 6 digit
}

function signResetToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "10m" });
}

/* -------------------- 1) Request OTP -------------------- */
/**
 * POST /api/auth/password-otp/request
 * body: { email, userType: "admin" | "technician" }
 */
export const requestPasswordOtp = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const userType = req.body.userType;

  if (!email || !userType) {
    return res.status(400).json({ message: "Email and userType are required" });
  }

  if (!["admin", "technician"].includes(userType)) {
    return res.status(400).json({ message: "Invalid userType" });
  }

  try {
    // ✅ Anti-enumeration response: always success message
    const safeResponse = {
      message: "If an account exists, OTP has been sent to the email.",
    };

    // Find user by email
    let userRes;
    if (userType === "admin") {
      userRes = await pool.query(`SELECT id, email FROM users WHERE email = $1`, [email]);
    } else {
      userRes = await pool.query(
        `SELECT id, email FROM technicians WHERE email = $1`,
        [email]
      );
    }

    // If user doesn't exist: return same message
    if (!userRes.rows.length) {
      return res.json(safeResponse);
    }

    // Rate limit: max 3 OTP requests in 15 minutes
    const limitRes = await pool.query(
      `
      SELECT COUNT(*)
      FROM auth_otp_codes
      WHERE email = $1
        AND user_type = $2
        AND created_at > now() - interval '15 minutes'
      `,
      [email, userType]
    );

    if (Number(limitRes.rows[0].count) >= MAX_OTP_REQUESTS_15_MIN) {
      // still not revealing whether user exists
      return res.json(safeResponse);
    }

    // Generate OTP + hash
    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await pool.query(
      `
      INSERT INTO auth_otp_codes (email, user_type, otp_hash, expires_at)
      VALUES ($1, $2, $3, now() + interval '${OTP_EXP_MINUTES} minutes')
      `,
      [email, userType, otpHash]
    );

    // Send OTP mail
    await sendEmail({
      to: email,
      subject: "Password Reset OTP",
      html: `
        <p>Hello,</p>
        <p>Your OTP for password reset is:</p>
        <h2 style="letter-spacing:2px;">${otp}</h2>
        <p>This OTP expires in ${OTP_EXP_MINUTES} minutes.</p>
        <p>If you did not request this, ignore this email.</p>
      `,
    });

    return res.json(safeResponse);
  } catch (err) {
    console.error("requestPasswordOtp error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* -------------------- 2) Verify OTP -------------------- */
/**
 * POST /api/auth/password-otp/verify
 * body: { email, userType, otp }
 * returns: { resetToken }
 */
export const verifyPasswordOtp = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const userType = req.body.userType;
  const otp = String(req.body.otp || "").trim();

  if (!email || !userType || !otp) {
    return res.status(400).json({ message: "Email, userType and otp are required" });
  }

  if (!["admin", "technician"].includes(userType)) {
    return res.status(400).json({ message: "Invalid userType" });
  }

  try {
    // get latest unused otp
    const otpRes = await pool.query(
      `
      SELECT *
      FROM auth_otp_codes
      WHERE email = $1
        AND user_type = $2
        AND used = false
        AND expires_at > now()
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [email, userType]
    );

    if (!otpRes.rows.length) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const row = otpRes.rows[0];

    // brute force prevention
    if (row.attempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({ message: "Too many attempts. Request new OTP." });
    }

    const ok = await bcrypt.compare(otp, row.otp_hash);

    if (!ok) {
      await pool.query(`UPDATE auth_otp_codes SET attempts = attempts + 1 WHERE id = $1`, [
        row.id,
      ]);
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // mark used
    await pool.query(`UPDATE auth_otp_codes SET used = true WHERE id = $1`, [row.id]);

    // create reset token (short-lived)
    const resetToken = signResetToken({
      email,
      userType,
      purpose: "reset_password",
    });

    return res.json({ message: "OTP verified", resetToken });
  } catch (err) {
    console.error("verifyPasswordOtp error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* -------------------- 3) Reset Password -------------------- */
/**
 * POST /api/auth/password-otp/reset
 * body: { resetToken, newPassword }
 */
export const resetPasswordWithOtp = async (req, res) => {
  const resetToken = req.body.resetToken;
  const newPassword = String(req.body.newPassword || "");

  if (!resetToken || !newPassword) {
    return res.status(400).json({ message: "resetToken and newPassword are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    if (!decoded || decoded.purpose !== "reset_password") {
      return res.status(401).json({ message: "Invalid reset token" });
    }

    const email = normalizeEmail(decoded.email);
    const userType = decoded.userType;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (userType === "admin") {
      const upd = await pool.query(
        `UPDATE users SET password=$1 WHERE email=$2 RETURNING id`,
        [hashedPassword, email]
      );

      if (!upd.rows.length) return res.status(404).json({ message: "User not found" });
    } else {
      const upd = await pool.query(
        `
        UPDATE technicians
        SET password=$1,
            must_change_password=false
        WHERE email=$2
        RETURNING id
        `,
        [hashedPassword, email]
      );

      if (!upd.rows.length) return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("resetPasswordWithOtp error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
