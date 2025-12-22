import { sendEmail} from "../sendEmail.js";

export async function sendTechnicianReminder({
    technicianEmail,
    technicianName,
    customerName,
    customerPhone,
    customerAddress,
    businessName,
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