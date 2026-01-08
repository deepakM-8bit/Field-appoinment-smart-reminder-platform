import pool from "../db.js";
import { sendEmail } from "../utils/sendEmail.js";

// admin appointment list (modal view)
export const getAdminAppointmentsList = async (req, res) => {
  const ownerId = req.user.id;
  const { filter = "completed", page = 1, phone = "" } = req.query;

  const limit = 10;
  const offset = (page - 1) * limit;

  let whereClause = `
    WHERE a.owner_id = $1
  `;
  const values = [ownerId];
  let idx = 2;

  // filter logic
  if (filter === "completed") {
    whereClause += `
      AND a.appointment_type = 'repair'
      AND a.status = 'repair_completed'
    `;
  }

  if (filter === "diagnosis") {
    whereClause += `
      AND a.appointment_type = 'diagnosis'
      AND a.status IN ('diagnosis_scheduled', 'diagnosis_in_progress')
    `;
  }

  if (filter === "repair") {
    whereClause += `
      AND a.appointment_type = 'repair'
      AND a.status IN ('repair_scheduled', 'repair_in_progress')
    `;
  }

  // phone search
  if (phone) {
    whereClause += ` AND c.phone ILIKE $${idx}`;
    values.push(`%${phone}%`);
    idx++;
  }

  try {
    const dataQuery = `
      SELECT
        a.id,
        a.appointment_type,
        a.status,
        a.category,
        a.scheduled_date,
        a.scheduled_time,
        c.name AS customer_name,
        c.phone AS customer_phone,
        t.name AS technician_name
      FROM appointments a
      JOIN customers c ON c.id = a.customer_id
      LEFT JOIN technicians t ON t.id = a.technician_id
      ${whereClause}
      ORDER BY a.scheduled_date DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countQuery = `
      SELECT COUNT(*) 
      FROM appointments a
      JOIN customers c ON c.id = a.customer_id
      ${whereClause}
    `;

    const [dataRes, countRes] = await Promise.all([
      pool.query(dataQuery, values),
      pool.query(countQuery, values)
    ]);

    return res.json({
      data: dataRes.rows,
      total: Number(countRes.rows[0].count),
      page: Number(page),
      totalPages: Math.ceil(countRes.rows[0].count / limit)
    });

  } catch (err) {
    console.error("Admin appointment list error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// cancel active diagnosis or repair
export const cancelAppointment = async (req, res) => {
  const appointmentId = req.params.id;
  const ownerId = req.user.id;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const apptRes = await client.query(
      `
      SELECT 
        a.*,
        t.email AS technician_email,
        t.name AS technician_name
      FROM appointments a
      LEFT JOIN technicians t ON t.id = a.technician_id
      WHERE a.id = $1
        AND a.owner_id = $2
        AND a.status NOT IN ('repair_completed', 'cancelled')
      `,
      [appointmentId, ownerId]
    );

    if (!apptRes.rows.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Appointment cannot be cancelled"
      });
    }

    const appointment = apptRes.rows[0];

    await client.query(
      `
      UPDATE appointments
      SET status = 'cancelled', updated_at = now()
      WHERE id = $1
      `,
      [appointmentId]
    );

    // notify technician
    if (appointment.technician_email) {
      await sendEmail({
        to: appointment.technician_email,
        subject: "Appointment Cancelled",
        html: `
          <p>Hello ${appointment.technician_name},</p>
          <p>An appointment scheduled on 
          <b>${appointment.scheduled_date}</b> has been cancelled by admin.</p>
        `
      });
    }

    await client.query(
      `
      INSERT INTO logs (owner_id, appointment_id, event, description)
      VALUES ($1,$2,$3,$4)
      `,
      [
        ownerId,
        appointmentId,
        "appointment_cancelled",
        "Appointment cancelled by admin"
      ]
    );

    await client.query("COMMIT");

    return res.json({ message: "Appointment cancelled successfully" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Cancel appointment error:", err);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};
