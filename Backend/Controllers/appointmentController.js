import { sendEmail } from "../utils/sendEmail.js";
import { notifyAdmin } from "../utils/notifyAdmin.js";
import pool from "../db.js";

function timeToMinutes(timestr) {
  if (!timestr) return undefined;
  const [h, m] = timestr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

// admin create appointment (diagnosis/repair)
export const createAppointment = async (req, res) => {
  const { name, phoneno, email, address, category, sd, st } = req.body;
  const userId = req.user.id;

  if (!phoneno || !category || !sd || !st) {
    return res.status(400).json({ message: "missing input fields" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const ownerRes = await client.query("SELECT name FROM users WHERE id=$1", [
      userId,
    ]);
    const businessName = ownerRes.rows[0]?.name || "Business";

    // ✅ Customer check / create
    const existingCustomer = await client.query(
      "SELECT * FROM customers WHERE phone=$1 AND owner_id=$2",
      [phoneno, userId],
    );

    let customer;
    if (existingCustomer.rows.length === 0) {
      const addCustomer = await client.query(
        `
        INSERT INTO customers (owner_id, name, phone, email, address)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *
        `,
        [userId, name, phoneno, email, address],
      );
      customer = addCustomer.rows[0];
    } else {
      customer = existingCustomer.rows[0];
    }

    const customerId = customer.id;

    /* ------------------------------------------------------------------
       ✅ Technician auto-assign (OPTIMIZED, SAME LOGIC)
       Old: N+1 workload queries (1 per technician)
       New: compute workloads for all technicians in one GROUP BY query
    ------------------------------------------------------------------ */
    const getTechnicians = await client.query(
      `
      SELECT 
        id, name, email, phone, category,
        work_start_time, work_end_time, active
      FROM technicians
      WHERE owner_id=$1
        AND active=true
      `,
      [userId],
    );

    const technicians = getTechnicians.rows;

    let chosenTechnicianId = null;
    let chosenTechnician = null;

    if (technicians.length > 0) {
      const normalizedReqCategory = category.toLowerCase().replace(/\s+/g, "");

      // gather tech ids
      const techIds = technicians.map((t) => t.id);

      // single query for all workloads
      const workloadRes = await client.query(
        `
        SELECT
          technician_id,
          COALESCE(
            SUM(
              CASE
                WHEN appointment_type = 'diagnosis'
                     AND status IN ('diagnosis_scheduled','diagnosis_in_progress')
                  THEN COALESCE(estimated_duration, 60)

                WHEN appointment_type = 'repair'
                     AND status IN ('repair_scheduled','repair_in_progress')
                  THEN COALESCE(estimated_duration, 60)

                ELSE 0
              END
            ),
            0
          ) AS minutes
        FROM appointments
        WHERE technician_id = ANY($1::int[])
          AND scheduled_date = $2
        GROUP BY technician_id
        `,
        [techIds, sd],
      );

      // map: techId -> workload minutes
      const workloadMap = {};
      for (const row of workloadRes.rows) {
        workloadMap[row.technician_id] = Number(row.minutes) || 0;
      }

      let bestTech = null;

      for (const tech of technicians) {
        if (!tech.email) continue;

        // category match
        const techCategories = String(tech.category || "")
          .toLowerCase()
          .replace(/\s+/g, "")
          .split(",");

        const canDoCategory = techCategories.includes(normalizedReqCategory);
        if (!canDoCategory) continue;

        // workload lookup
        const workloadMinutes = workloadMap[tech.id] || 0;

        // capacity calculation
        const workStartTime = timeToMinutes(tech.work_start_time);
        const workEndTime = timeToMinutes(tech.work_end_time);
        if (workStartTime === undefined || workEndTime === undefined) continue;

        const capacityMinutes = workEndTime - workStartTime;
        const remainingCapacity = capacityMinutes - workloadMinutes;

        const diagnosisDurationMinutes = 60;
        const canFit = remainingCapacity >= diagnosisDurationMinutes;

        if (canFit) {
          if (!bestTech || workloadMinutes < bestTech.workloadMinutes) {
            bestTech = {
              id: tech.id,
              workloadMinutes,
            };
          }
        }
      }

      if (bestTech) {
        chosenTechnician = technicians.find((t) => t.id === bestTech.id);
        chosenTechnicianId = chosenTechnician?.id || null;
      }
    }

    const status = chosenTechnicianId
      ? "diagnosis_scheduled"
      : "waiting_for_assignment";

    /*----Appointment insert----*/
    const insertAppointment = await client.query(
      `
      INSERT INTO appointments (
        owner_id, customer_id, technician_id,
        appointment_type, status, category,
        scheduled_date, scheduled_time
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        userId,
        customerId,
        chosenTechnicianId,
        "diagnosis",
        status,
        category,
        sd,
        st,
      ],
    );

    const appointment = insertAppointment.rows[0];

    if (!chosenTechnicianId) {
      await notifyAdmin({
        ownerId: userId,
        subject: "Diagnosis requires manual assignment",
        message: `Diagnosis appointment (ID: ${appointment.id}) was created but no technician was available for category "${category}".`,
      });
    }

    /*----Reminder insert----*/
    if (chosenTechnicianId) {
      const sendAt = new Date();

      await client.query(
        `
        INSERT INTO reminders (appointment_id, send_at, type, meta)
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
            'scheduled_time', $10::time,
            'onwer_id', $11::text
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
          st,
          userId,
        ],
      );

      if (customer.email) {
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
              'scheduled_time', $9::time,
              'owner_id', $10::text
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
            st,
            userId,
          ],
        );
      }

      /*----Insert logs----*/
      await client.query(
        `
        INSERT INTO logs(owner_id, appointment_id, technician_id, event, description)
        VALUES ($1,$2,$3,$4,$5)
        `,
        [
          userId,
          appointment.id,
          chosenTechnicianId,
          "diagnosis_created",
          chosenTechnicianId
            ? "Diagnosis appointment created and technician auto-assigned"
            : "Diagnosis appointment created but no technician available",
        ],
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Diagnosis appointment created",
      appointment,
      customer,
      autoAssignedTechnicianId: chosenTechnicianId,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("error creating diagnosis appointment:", err);
    return res.status(500).json({ message: "internal server error" });
  } finally {
    client.release();
  }
};

//diagnosis completion logic
export const completeDiagnosis = async (req, res) => {
  const appointmentId = req.params.id;
  const technicianId = req.user.id;

  const {
    issue_description,
    requires_parts,
    estimated_duration,
    estimated_cost,
    final_cost,
    suggested_repair_date,
    suggested_repair_time,
  } = req.body;

  if (
    !issue_description ||
    Number(estimated_duration) <= 0 ||
    Number(estimated_cost) <= 0 ||
    requires_parts === undefined ||
    !suggested_repair_date
  ) {
    return res.status(400).json({ message: "missing diagnosis details" });
  }

  const client = await pool.connect();

  try {
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
      [appointmentId, technicianId],
    );

    if (!apptRes.rows.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Invalid appointment state for diagnosis completion",
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
              final_cost = $5,
              scheduled_date = $6,
              scheduled_time = $7,
              status = 'diagnosis_completed_waiting_approval',
              updated_at = now()
            WHERE id = $8
            `,
      [
        issue_description,
        requires_parts,
        estimated_duration,
        estimated_cost,
        final_cost,
        suggested_repair_date,
        suggested_repair_time || null,
        appointmentId,
      ],
    );

    //send quote email to customer
    if (appointment.customer_email) {
      await sendEmail({
        to: appointment.customer_email,
        subject: "Repair Qoute - Approval Required",
        html: `
              <p>Hello <b>${appointment.customer_name}</b>,</p>
              
              <p>Your service diagnosis has been completed by <b>${appointment.business_name}</b>.</p>

              <p>Issue Identified:${issue_description}</p>
              <p>Estimated Cost:${estimated_cost}</p>
              <p>suggested Repair Schedule:${suggested_repair_date} at ${suggested_repair_time}</p>
              
              <p><b>Kindly confirm to proceed with the repair</b></p>
              
              <p>Thank You!</p>
              `,
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
        "Diagnosis completed and qoute sent to customer",
      ],
    );

    await client.query("COMMIT");

    return res.json({
      message: "Diagnosis completed and qoute sent for approval",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("diagnosis completion failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

//approve repair logic
export const approveRepair = async (req, res) => {
  const diagnosisId = req.params.id;
  const userId = req.user.id; //admin

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const diagRes = await client.query(
      `
            SELECT 
            a.*,
            c.name AS customer_name,
            c.phone AS customer_phone,
            c.email AS customer_email,
            c.address AS customer_address,
            t.name AS technician_name,
            t.email AS technician_email,
            t.phone AS technician_phone,
            u.name AS business_name
             FROM appointments a
             JOIN customers c ON c.id = a.customer_id
             LEFT JOIN technicians t ON t.id = a.technician_id
             JOIN users u ON u.id = a.owner_id
             WHERE a.id = $1
              AND a.appointment_type = 'diagnosis'
              AND a.status = 'diagnosis_completed_waiting_approval'
              AND a.owner_id = $2
             `,
      [diagnosisId, userId],
    );

    if (!diagRes.rows.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Diagnosis not eligible for repair approval",
      });
    }

    const diag = diagRes.rows[0];

    let technicianId = diag.technician_id;
    let repairStatus = "repair_scheduled";

    if (technicianId) {
      const workloadRes = await client.query(
        `
                SELECT COALESCE(
                SUM(estimated_duration),0
                ) AS minutes
                 FROM appointments
                 WHERE technician_id = $1
                  AND scheduled_date = $2
                  AND status IN ('repair_scheduled','repair_in_progress')
                  `,
        [technicianId, diag.scheduled_date],
      );

      const workloadMinutes = Number(workloadRes.rows[0].minutes);

      if (workloadMinutes + diag.estimated_duration > 480) {
        technicianId = null;
        repairStatus = "waiting_for_assignment";
      }
    }

    const repairRes = await client.query(
      `
          UPDATE appointments
          SET
            technician_id = $1,
            appointment_type = 'repair',
            status = $2,
            category = $3,
            issue_description = $4,
            requires_parts = $5,
            estimated_duration = $6,
            estimated_cost = $7,
            final_cost = $8,
            scheduled_date = $9,
            scheduled_time = $10,
            updated_at = now()
          WHERE id = $11
            AND owner_id = $12
          RETURNING *
          `,
      [
        technicianId,
        repairStatus,
        diag.category,
        diag.issue_description,
        diag.requires_parts,
        diag.estimated_duration,
        diag.estimated_cost,
        diag.final_cost,
        diag.scheduled_date,
        diag.scheduled_time,
        diagnosisId,
        userId,
      ],
    );

    const repair = repairRes.rows[0];

    if (!technicianId) {
      await notifyAdmin({
        ownerId: userId,
        subject: "Repair appointment unassigned",
        message: `Repair appointment (ID: ${repair.id}) could not be auto-assigned 
                due to technician capacity limits.`,
      });
    }

    if (technicianId && diag.technician_email) {
      await client.query(
        `
                INSERT INTO reminders (appointment_id, send_at, type, meta)
                VALUES (
                $1,
                $2,
                'technician_repair_reminder',
                jsonb_build_object(
                   'technician_email', $3::text,
                   'technician_name', $4::text,
                   'customer_name', $5::text,
                   'customer_phone', $6::text,
                   'customer_address', $7::text,
                   'business_name', $8::text,
                   'scheduled_date', $9::date,
                   'scheduled_time', $10::time,
                   'onwer_id', $11::text
                   )
                )
                `,
        [
          repair.id,
          new Date(),
          diag.technician_email,
          diag.technician_name,
          diag.customer_name,
          diag.customer_phone,
          diag.customer_address,
          diag.business_name,
          repair.scheduled_date,
          repair.scheduled_time,
          userId,
        ],
      );
    }

    if (diag.customer_email) {
      await client.query(
        `
                INSERT INTO reminders (appointment_id, send_at, type, meta)
                VALUES (
                $1,
                $2,
                'customer_repair_reminder',
                jsonb_build_object(
                   'customer_email', $3::text,
                   'customer_name', $4::text,
                   'business_name', $5::text,
                   'technician_name', $6::text,
                   'technician_phone', $7::text,
                   'scheduled_date', $8::date,
                   'scheduled_time', $9::time,
                   'owner_id', $10::text
                   )
                )
                `,
        [
          repair.id,
          new Date(),
          diag.customer_email,
          diag.customer_name,
          diag.business_name,
          diag.technician_name,
          diag.technician_phone,
          repair.scheduled_date,
          repair.scheduled_time,
          userId,
        ],
      );
    }

    await client.query(
      `
            INSERT INTO logs (
            owner_id, appointment_id, technician_id, event, description
            )
            VALUES ($1,$2,$3,$4,$5)
            `,
      [
        diag.owner_id,
        repair.id,
        technicianId,
        "repair_created",
        technicianId
          ? "Repair appointment auto-created"
          : "Repair created but technician unavailable",
      ],
    );

    // await client.query(
    //     `
    //     UPDATE appointments

    //     SET status = 'repair_scheduled', updated_at = now()
    //     WHERE id = $1
    //     `,
    //     [diagnosisId]
    // );

    console.log({
      technicianEmail: diag.technician_email,
      customerEmail: diag.customer_email,
    });

    await client.query("COMMIT");

    return res.json({
      message: "Repair appointment created successfully",
      repairAppointment: repair,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Repair approval failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};

// view appoinment list
export const getAppointmentById = async (req, res) => {
  const appointmentId = req.params.id;
  const user = req.user;

  try {
    const result = await pool.query(
      `
      SELECT
        a.id,
        a.technician_id,
        a.appointment_type,
        a.status,
        a.category,
        a.scheduled_date,
        a.scheduled_time,
        c.name AS customer_name,
        c.phone AS customer_phone,
        c.address AS customer_address
      FROM appointments a
      JOIN customers c ON c.id = a.customer_id
      WHERE a.id = $1
      `,
      [appointmentId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const appointment = result.rows[0];

    // Authorization check
    if (user.role === "technician" && appointment.technician_id !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.json(appointment);
  } catch (err) {
    console.error("Get appointment by ID error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//technican view the allocated job
export const getAppointmentsForTechnicianByDate = async (req, res) => {
  if (req.user.role !== "technician") {
    return res.status(403).json({ message: "Access denied" });
  }

  const technicianId = req.user.id;

  // if date not provided, fallback to today
  const date = req.query.date || new Date().toISOString().split("T")[0];

  try {
    const result = await pool.query(
      `
      SELECT
        a.id,
        a.appointment_type,
        a.status,
        a.category,
        a.scheduled_time,
        a.scheduled_date,
        c.name AS customer_name,
        c.address AS customer_address
      FROM appointments a
      JOIN customers c ON c.id = a.customer_id
      WHERE a.technician_id = $1
        AND a.scheduled_date = $2
      ORDER BY a.scheduled_time ASC
      `,
      [technicianId, date],
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("Technician appointments (by date) error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// admin view pending approvals
export const listPendingApprovals = async (req, res) => {
  const ownerId = req.user.id;

  try {
    const result = await pool.query(
      `
      SELECT 
        a.id,
        a.category,
        a.estimated_cost,
        a.scheduled_date,
        c.name AS customer_name,
        c.phone AS customer_phone
      FROM appointments a
      JOIN customers c ON c.id = a.customer_id
      WHERE a.owner_id = $1
        AND a.status = 'diagnosis_completed_waiting_approval'
      ORDER BY a.created_at ASC
      LIMIT 10
      `,
      [ownerId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Pending approvals error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get unassigned appointment for manual assignment by admin
export const getUnassignedAppointments = async (req, res) => {
  const ownerId = req.user.id;
  try {
    const result = await pool.query(
      `
      SELECT 
        a.id, 
        a.customer_id, 
        a.category, 
        a.scheduled_date,
        c.name AS customer_name
      FROM appointments a
      JOIN customers c ON c.id = a.customer_id
      WHERE a.owner_id = $1
        AND a.technician_id IS NULL
        AND status IN = 'waiting_for_assignment'
      ORDER BY a.scheduled_date ASC
      LIMIT 10
      `,
      [ownerId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Unassigned appointments error:", err.message);
    res
      .status(500)
      .json({ message: "Failed to fetch unassigned appointments" });
  }
};

//admin assign technician manually
export const assignTechnicianManually = async (req, res) => {
  const { id } = req.params;
  const { technicianId } = req.body;

  if (!technicianId) {
    return res.status(400).json({ message: "Technician ID is required" });
  }

  try {
    // Check appointment
    const appointment = await pool.query(
      "SELECT id FROM appointments WHERE id = $1",
      [id],
    );

    if (appointment.rowCount === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check technician
    const technician = await pool.query(
      "SELECT id FROM technicians WHERE id = $1",
      [technicianId],
    );

    if (technician.rowCount === 0) {
      return res.status(404).json({ message: "Technician not found" });
    }

    // Assign technician
    await pool.query(
      `
      UPDATE appointments
      SET technician_id = $1, status = 'assigned'
      WHERE id = $2
      `,
      [technicianId, id],
    );

    res.json({ message: "Technician assigned successfully" });
  } catch (err) {
    console.error("Manual assignment error:", err.message);
    res.status(500).json({ message: "Failed to assign technician" });
  }
};

// find customer by phone (admin)
export const getCustomerByPhone = async (req, res) => {
  const ownerId = req.user.id;
  const { query } = req.query;

  if (!query || query.length < 2) {
    return res.json([]);
  }

  try {
    const result = await pool.query(
      `
      SELECT id, name, phone, email, address
      FROM customers
      WHERE owner_id = $1
        AND phone ILIKE $2
      ORDER BY phone
      LIMIT 5  
      `,
      [ownerId, `${query}%`],
    );

    // Important: return null if not found (frontend expects this)
    return res.json(result.rows || null);
  } catch (err) {
    console.error("Get customer by phone error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
