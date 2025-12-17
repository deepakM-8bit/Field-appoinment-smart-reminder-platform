import cron from 'node-cron';
import pool from '../db.js';
import { sendTechnicianReminder } from "../utils/messages/technicianReminder.js";

cron.schedule("* * * * *", async () => {
    const { rows } = await pool.query(
        "SELECT * FROM reminders WHERE send_at <= now() AND status= 'pending' AND attempts < 5"
    );

    for (const r of rows) {
        try {
            if (r.type === "technician_reminder") {
                await sendTechnicianReminder({
                    technicianPhone: r.meta.technician_phone,
                    technicianName: r.meta.technician_name,
                    customerName: r.meta.customer_name,
                    customerPhone: r.meta.customer_phone,
                    customerAddress: r.meta.customer_address,
                    scheduledDate: r.meta.scheduled_date,
                    scheduledTime: r.meta.scheduled_time
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