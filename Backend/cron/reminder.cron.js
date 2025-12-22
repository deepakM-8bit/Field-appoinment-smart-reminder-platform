import cron from 'node-cron';
import pool from '../db.js';
import { sendTechnicianReminder } from "../utils/messages/technicianReminder.js";
import { sendCustomerReminder } from "../utils/messages/customerReminder.js";


cron.schedule("* * * * *", async () => {
    const { rows } = await pool.query(
        "SELECT * FROM reminders WHERE send_at <= now() AND status= 'pending' AND attempts < 5"
    );

    for (const r of rows) {
        try {
            if (r.type === "technician_reminder") {
                await sendTechnicianReminder({
                    technicianEmail: r.meta.technician_email,
                    technicianName: r.meta.technician_name,
                    businessName: r.meta.business_name,
                    customerName: r.meta.customer_name,
                    customerPhone: r.meta.customer_phone,
                    customerAddress: r.meta.customer_address,
                    scheduledDate: r.meta.scheduled_date,
                    scheduledTime: r.meta.scheduled_time
                });
            }

            if (r.type === "customer_reminder") {
                if(!r.meta.customer.email) {
                    await pool.query(
                        "UPDATE reminders SET status='skipped' WHERE id=$1",
                        [r.id]
                    );
                    continue;
                }

                await sendCustomerReminder({
                    customerEmail: r.meta.customer_email,
                    customerName: r.meta.customer_name,
                    businessName: r.meta.business_name,
                    technicianName: r.meta.technician_name,
                    technicianPhone: r.meta.technician_phone,
                    technicianPhone: r.meta.technician_phone,
                    scheduledDate: r.meta.scheduled_date,
                    scheduledTime: r.meta.schedule_time 
                });
            }

            await pool.query(
                "UPDATE reminders SET status='sent', attempts=attempts+1 WHERE id=$1",
                [r.id]
            );

        }catch(err){
            console.error("reminder failed:", err.message);
            await pool.query(
                "UPDATE reminders SET attempts=attempts+1 WHERE id=$1",
                [r.id]
            );
        }
    }
});