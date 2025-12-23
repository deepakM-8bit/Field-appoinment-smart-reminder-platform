import { application } from "express";
import pool from "../db.js";

function timeToMinutes(timestr){
    if(!timestr) return ;
    const [h,m,s] = timestr.split(":").map(Number);
    return (h||0) * 60 + (m||0);
}

//admin create appointment (diagnosis/repair)
export const createAppointment = async(req,res)=>{
    const {name,phoneno,email,address,category,sd,st} = req.body;
    const userId = req.user.id;

    if(!phoneno || !category || !sd || !st){
        return res.status(400).json({message:"missing input fields"});
    }

    const client = await pool.connect();

    try{
        await client.query("BEGIN");

        const ownerRes = await client.query(
          "SELECT name FROM users WHERE id=$1",
          [userId]
        );
        const businessName = ownerRes.rows[0].name;


        const existingCustomer = await client.query("SELECT * FROM customers WHERE phone=$1 AND owner_id=$2",
            [phoneno, userId]   
        );

        let customer;
       
        if(existingCustomer.rows.length === 0){
            const addCustomer = await client.query("INSERT INTO customers (owner_id, name, phone, email, address) VALUES ($1,$2,$3,$4,$5) RETURNING *",
                [userId, name, phoneno, email, address]);

                customer = addCustomer.rows[0];
        }else{
            customer = existingCustomer.rows[0];
        }

        const customerId = customer.id;

        /*----Tehcnician aut0-assign----*/
        const getTechnicians = await client.query (`
            SELECT * FROM technicians 
            WHERE owner_id=$1 
            AND active=true`,
            [userId]
        );
        const technicians = getTechnicians.rows;

        let chosenTechnicianId = null;
        let chosenTechnician = null;

        if(technicians.length > 0){
            let bestTech = null;

            for(const tech of technicians){

                if(!tech.email){
                    continue;
                }

                const normalizedReqCategory = category.toLowerCase().replace(/\s+/g, '');

                const techCategories = tech.category
                    .toLowerCase()
                    .replace(/\s+/g, '')
                    .split(',');

                const canDoCategory = techCategories.includes(normalizedReqCategory);

                if (!canDoCategory) {
                    continue; // skip this technician
                }

                const workload = await client.query(`
                    SELECT COALESCE(
                        SUM(
                          CASE
                            WHEN appointment_type = 'diagnosis'
                                 AND status IN ('diagnosis_scheduled','diagnosis_in_progress')
                              THEN COALESCE(estimated_duration,60)
                                 
                            WHEN appointment_type = 'repair'
                                 AND status IN ('repair_scheduled','repair_in_progress')
                              THEN COALESCE(estimated_duration,60)
                        
                            ELSE 0  
                         END
                        ),0
                    )AS minutes
                    FROM appointments
                    WHERE technician_id=$1
                      AND scheduled_date=$2;
                `,
                [tech.id,sd]
            );

                const workloadMinutes = Number(workload.rows[0].minutes)||0;

                const workStartTime = timeToMinutes(tech.work_start_time);
                const workEndTime = timeToMinutes(tech.work_end_time);
                const capacityMinutes = workEndTime - workStartTime;
                const remainingCapacity = capacityMinutes - workloadMinutes;

                const diagnosisDurationMinutes = 60;
                
                const canFit = remainingCapacity >= diagnosisDurationMinutes;

                if(canFit){
                    if(!bestTech || workloadMinutes < bestTech.workloadMinutes){
                        bestTech={
                            id:tech.id,
                            workloadMinutes,
                        };
                    }
                }
            }
            if(bestTech){
                chosenTechnician = technicians.find(t => t.id === bestTech.id);
                chosenTechnicianId = chosenTechnician.id;
            }
        }

        const status = chosenTechnicianId 
         ? "diagnosis_scheduled" 
         : "waiting_for_assignment";

        /*----Appointment insert----*/
        const insertAppointment = await client.query(
            `INSERT INTO appointments (owner_id, customer_id,
             technician_id, appointment_type, status, category,
             scheduled_date, scheduled_time) VALUES 
            ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
            [userId, customerId, chosenTechnicianId, "diagnosis",
                 status, category, sd, st]
        );

        const appointment = insertAppointment.rows[0];

        /*----Reminder insert----*/
        if(chosenTechnicianId){
            const sendAt = new Date();

            await client.query(
             `INSERT INTO reminders (appointment_id, send_at, type, meta)
              VALUES (
                 $1,
                 $2,
                 'technician_reminder',
                 jsonb_build_object(
                   'technician_email', $3::text,
                   'technician_name', $4::text,
                   'customer_name', $5::text,
                   'customer_address', $6::text,
                   'customer_phone', $7::text,
                   'business_name', $8::text,
                   'scheduled_date', $9::date,
                   'scheduled_time', $10::time
                )      
            )
            `, 
            [
             appointment.id,
             sendAt,
             chosenTechnician.email,
             chosenTechnician.name,
             customer.name,
             customer.address,
             customer.phone,
             businessName,
             sd,
             st
            ]
         );

         if(customer.email) {
            await client.query(
                `
                INSERT INTO reminders (appointment_id, send_at, type, meta)
                VALUES (
                $1,
                $2,
                'customer_reminder',
                jsonb_build_object(
                  'business_name', $3::text,
                  'customer_email', $4::text,
                  'customer_name', $5::text,
                  'technician_name', $6::text,
                  'technician_phone', $7::text,
                  'scheduled_date', $8::date,
                  'scheduled_time', $9::time
                 )
                )
                `,
                [
                   appointment.id,
                   sendAt,
                   businessName,
                   customer.email,
                   customer.name,
                   chosenTechnician.name,
                   chosenTechnician.phone,
                   sd,
                   st                   
                ]
            );
         }

        /*----Insert logs----*/ 
        await client.query(
            `INSERT INTO logs(owner_id, appointment_id, technician_id, event, description)
            VALUES ($1,$2,$3,$4,$5)`,
            [userId, 
            appointment.id,
            chosenTechnicianId, 
            "diagnosis_created",
            chosenTechnicianId 
                ? "Diagnosis appointment created and technician auto-assigned" 
                : "Diagnosis appointment created but no technician available"
            ]
          );
        }
      
         await client.query("COMMIT");
         console.log(req.body);
         console.log(appointment);
         return res.status(201).json({
            message:"Diagnosis appointment created",
            appointment,
            customer,
            autoAssignedTechnicianId:chosenTechnicianId,
        });

    }catch(err){
        console.log(req.body);
        await client.query("ROLLBACK");
        console.error("error creating diagnosis appoinment:",err);
        return res.status(500).json({message:"internal server error"});
    }finally{
        client.release();
    }
};

export const completeDiagnosis = async (req,res) => {
    const appointmentId = req.params.id;
    const technicianId = req.user.id;

    const{
        issue_description,
        requires_part,
        estimated_duration,
        estimated_cost,
        suggested_repair_date,
        suggested_repair_time
    } = req.body;

    if(
        !issue_description ||
        !estimated_duration ||
        !estimated_cost ||
        !requires_part ||
        !suggested_repair_date
    ) {
        return res.status(400).json({message: "missing diagnosis details"});
    }

    const client = await pool.connect();

    try{
        await client.query("BEGIN");

        //validate appointment + technician
        const apptRes = await client.query(
            `
            SELECT 
            a.*,
            c.email AS customer_email,
            c.name AS customer_name,
            u.name AS business_name
            FROM appointments a
            JOIN customers c ON c.id = a.customer_id
            JOIN users u ON u.id = a.owner_id
            WHERE a.id = $1
             AND a.technician_id = $2
             AND a.status = 'diagnosis_in_progress'
             `,
             [appointmentId, technicianId]
        );

        if(!apptRes.rows.length) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                message:"Invalid appointment state for diagnosis completion"
            });
        }

        const appointment = apptRes.rows[0];

        //update appointment with diagnosis result
        await client.query(
            `
            UPDATE appointments
            SET
              issue_description = $1,
              requires_parts = $2,
              estimated_duration = $3,
              estimated_cost = $4,
              status = 'diagnosis_complete_waiting_approval',
              created_at = now()
            WHERE id = $5
            `,
            [
                issue_description,
                requires_part,
                estimated_duration,
                estimated_cost,
                appointmentId
            ]
        );

        //send quote email to customer
        if (appointment.customer_email) {
          await sendEmail({
            to: appointment.customer_email,
            subject: 'Repair Qoute - Approval Required',
            html:`
              <p>Hello <b>${appointment.customer.name}</b>,</p>
              
              <p>Your service diagnosis has been completed by <b>${appointment.business_name}</b>.</p>

              <p>Issue Identified:${issue_description}</p>
              <p>Estimated Cost:${estimated_cost}</p>
              <p>suggested Repair Schedule:${suggested_repair_date} at ${suggested_repair_time}</p>
              
              <p>Kindly confirm to proceed with the repair</p>
              
              <p>Thank You!</p>
              `
          });
        }

        //Insert logs
        await client.query(
            `
            INSERT INTO logs(
            owner_id,
            appointment_id,
            technician_id,
            event,
            description
            )
            VALUES ($1,$2,$3,$4,$5)
            `,
            [
                appointment.owner_id,
                appointmentId,
                technicianId,
                "diagnosis_completed",
                "Diagnosis completed and qoute sent to customer"
            ]
        );

        await client.query("COMMIT");

        return res.json({
            message:"Diagnosis completed and qoute sent for approval"
        });

    } catch(err) {
        await client.query("ROLLBACK");
        console.error("diagnosis completion failed:",err);
        return res.status(500).json({message: "Internal server error"});
    } finally {
        client.release();
    }
};

//admin can view appoinment list
export const listAppointment = async (req,res) => {

};

//technican view the allocated job
export const getAppoinmentById = async (req,res) => {
    
};

//technician updates the diagnosis
export const updateTechnicianDiagnosis = async (req,res) => {

};

//admin schedule repair date/time
export const scheduleRepair = async (req,res) => {

};