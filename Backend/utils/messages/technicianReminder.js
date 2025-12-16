import { sendWhatsappTemplate } from "../sendWhatsapp.js";

export async function sendTechnicianReminder({
    technicianPhone,
    technicianName,
    customerName,
    customerPhone,
    customerAddress,
    sheduledDate,
    sheduledTime
}) {
    return sendWhatsappTemplate({
        to:technicianPhone,
        templateName: "technician_reminder_v1",
        components: [
            {
                type: "body",
                parameters: [
                    { type:"text", text: technicianName },
                    { type:"text", text: customerName},
                    { type:"text", text: customerPhone},
                    { type:"text", text: customerAddress},
                    { type:"text", text: `${scheduledDate} ${scheduledTime}`}
                ]
            }
        ]
    });
}