import { sendEmail} from "../sendEmail.js";

const ownerResult = await pool.query(
    "SELECT name FROM users WHERE id=$1",
    [listAppointment.owner_id]
);
const businessName = ownerResult.rows[0].name;

export async function sendTechnicianReminder({
    technicianEmail,
    technicianName,
    customerName,
    customerPhone,
    customerAddress,
    scheduledDate,
    scheduledTime
}) {
    return sendEmail({
        to:technicianEmail,
        subject: "New Diagnosis Appointment Assigned",
        html:`
            <p>${businessName}</p>
            <p>Hello ${technicianName}, <br>
            You have a new diagnosis appointment</p>

            <ul>
            <li>Customer: ${customerName}</li>
            <li>Phone: ${customerPhone}</li>
            <li>Address: ${customerAddress}</li>
            <li>Date & Time: ${scheduledDate} ${scheduledTime}</li>
            </ul>
        `
    });
}