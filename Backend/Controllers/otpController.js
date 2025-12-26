import pool from "../db.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { OTP_CONFIG } from "../utils/otpConfig.js";

export const requestOtp = (type) => async (req, res) => {
  if (req.user.role !== "technician") {
    return res.status(403).json({ message: "Access denied" });
  }

  const cfg = OTP_CONFIG[type];
  const appointmentId = req.params.id;
  const technicianId = req.user.id;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const apptRes = await client.query(
      `
      SELECT a.*, c.email AS customer_email
      FROM appointments a
      JOIN customers c ON c.id = a.customer_id
      WHERE a.id = $1
        AND a.technician_id = $2
        AND a.status = $3
      `,
      [appointmentId, technicianId, cfg.allowedStatus]
    );

    if (!apptRes.rows.length) {
      return res.status(400).json({ message: "Invalid appointment state" });
    }

    const recentOtpCount = await client.query(
      `
      SELECT COUNT(*)
      FROM otp_codes
      WHERE appointment_id = $1
        AND type = $2
        AND created_at > now() - interval '5 minutes'
      `,
      [appointmentId, type]
    );

    if (Number(recentOtpCount.rows[0].count) >= 3) {
      return res.status(429).json({ message: "Too many OTP requests" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    await client.query(
      `
      INSERT INTO otp_codes (appointment_id, otp_code, type, expires_at)
      VALUES ($1,$2,$3, now() + interval '5 minutes')
      `,
      [appointmentId, otp, type]
    );

    await sendEmail({
      to: apptRes.rows[0].customer_email,
      subject: cfg.emailSubject,
      html: `<p>Your OTP is:</p><h2>${otp}</h2>`
    });

    await client.query(
      `
      INSERT INTO logs (owner_id, appointment_id, technician_id, event, description)
      VALUES ($1,$2,$3,$4,$5)
      `,
      [
        apptRes.rows[0].owner_id,
        appointmentId,
        technicianId,
        cfg.logEventSend,
        `OTP sent for ${type}`
      ]
    );

    await client.query("COMMIT");
    res.json({ message: "OTP sent successfully" });

  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};
