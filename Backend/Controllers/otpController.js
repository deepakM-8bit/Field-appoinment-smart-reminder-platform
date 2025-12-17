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

