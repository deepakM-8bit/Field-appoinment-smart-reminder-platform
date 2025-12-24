import { sendEmail } from "../sendEmail.js";

export async function sendCustomerReminder({
  customerEmail,
  customerName,
  businessName,
  technicianName,
  technicianPhone,
  scheduledDate,
  scheduledTime
}) {
  return sendEmail({
    to: customerEmail,
    subject: `Appointment Reminder - ${businessName}`,
    html: `
    <div style="
       font-size: 16px;
       padding: 12px;
       line-height: 1.6;
    ">

      <p>Hello <b>${customerName}</b>,</p>

      <p><b>This is a reminder for your upcoming service appointment.</b></p>

      <p><b>Service Center:</b> ${businessName}</p>
      <p><b>Technician:</b> ${technicianName}</p>
      <p><b>Technician Phone:</b> ${technicianPhone}</p>
      <p><b>Date & Time:</b> ${scheduledDate} ${scheduledTime}</p>

      <p>If you are unavailable, please contact the technician directly.</p>

    </div>  
    `
  });
}
