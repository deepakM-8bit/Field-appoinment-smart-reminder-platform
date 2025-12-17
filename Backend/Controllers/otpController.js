import pool from "../db.js";
import crypto from "crypto";
import { sendMessage } from "../utils/messaging/sendMessage.js";

export const requestDiagnosisOtp = async (req, res) => {
  const appointmentId = req.params.id;
  const technicianId = req.user.id; // technician token

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const apptRes = await client.query(
      `
      SELECT a.*, c.phone AS customer_phone
      FROM appointments a
      JOIN customers c ON c.id = a.customer_id
      WHERE a.id = $1
        AND a.technician_id = $2
        AND a.status = 'diagnosis_scheduled'
      `,
      [appointmentId, technicianId]
    );

    if (!apptRes.rows.length) {
      return res.status(400).json({ message: "Invalid appointment state" });
    }

    const appointment = apptRes.rows[0];

    // generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    await client.query(
      `
      INSERT INTO otp_codes (
        appointment_id, otp_code, type, expires_at
      )
      VALUES (
        $1, $2, 'start_diagnosis', now() + interval '5 minutes'
      )
      `,
      [appointmentId, otp]
    );

    await sendMessage({
      to: appointment.customer_phone,
      message: `Your OTP for diagnosis is ${otp}. Valid for 5 minutes.`,
      type: "otp"
    });

    await client.query(
      `
      INSERT INTO logs (owner_id, appointment_id, technician_id, event, description)
      VALUES ($1,$2,$3,$4,$5)
      `,
      [
        appointment.owner_id,
        appointmentId,
        technicianId,
        "otp_sent",
        "Diagnosis OTP sent to customer"
      ]
    );

    await client.query("COMMIT");

    return res.json({ message: "OTP sent to customer" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("OTP request failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

export const verifyDiagnosisOtp = async (req, res) => {
  const appointmentId = req.params.id;
  const technicianId = req.user.id;
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ message: "OTP required" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const otpRes = await client.query(
      `
      SELECT *
      FROM otp_codes
      WHERE appointment_id = $1
        AND otp_code = $2
        AND type = 'start_diagnosis'
        AND used = false
        AND expires_at > now()
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [appointmentId, otp]
    );

    if (!otpRes.rows.length) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await client.query(
      `
      UPDATE otp_codes
      SET used = true
      WHERE id = $1
      `,
      [otpRes.rows[0].id]
    );

    await client.query(
      `
      UPDATE appointments
      SET status = 'diagnosis_in_progress',
          updated_at = now()
      WHERE id = $1
        AND technician_id = $2
      `,
      [appointmentId, technicianId]
    );

    await client.query(
      `
      INSERT INTO logs (owner_id, appointment_id, technician_id, event, description)
      VALUES ($1,$2,$3,$4,$5)
      `,
      [
        req.user.owner_id || null,
        appointmentId,
        technicianId,
        "otp_verified",
        "Diagnosis OTP verified, diagnosis started"
      ]
    );

    await client.query("COMMIT");

    return res.json({ message: "OTP verified. Diagnosis started." });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("OTP verify failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

