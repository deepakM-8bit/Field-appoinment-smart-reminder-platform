import { sendWhatsappTemplate } from "../sendWhatsapp.js";

export async function sendTechnicianReminder({
    technicianPhone,
    technicianName,
    customerAddress,
    sheduledDate,
    sheduledTime
}){
    return sendWhatsappTemplate({
        to:technicianPhone,
        templateName: "technician_reminder_v1",
        components: [
            {
                type: "body",
                parameters: [
                    { type:"text", text: technicianName },
                    { type:"text", text: customerAddress}
                ]
            }
        ]
    })
}