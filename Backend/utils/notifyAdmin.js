import pool from "../db.js";
import { sendEmail } from "./sendEmail.js";

export async function notifyAdmin({ ownerId, subject, message }) {
  const res = await pool.query(
    "SELECT email, name FROM users WHERE id = $1",
    [ownerId]
  );

  if (!res.rows.length || !res.rows[0].email) return;

  const admin = res.rows[0];

  await sendEmail({
    to: admin.email,
    subject,
    html: `
      <p>Hello <b>${admin.name}</b>,</p>
      <p>${message}</p>
      <p><b>Action required.</b></p>
      <p>— Field Appointment System</p>
    `
  });
}
