import pool from "../db.js";

export const getDashboardSummary = async (req, res) => {
  const ownerId = req.user.id;

  try {
    const result = await pool.query(
      `
      SELECT
        -- today diagnosis count
        (
          SELECT COUNT(*)
          FROM appointments
          WHERE owner_id = $1
            AND appointment_type = 'diagnosis'
            AND created_at::date = CURRENT_DATE
        ) AS today_diagnosis,

        -- pending repair appointments
        (
          SELECT COUNT(*)
          FROM appointments
          WHERE owner_id = $1
            AND appointment_type = 'repair'
            AND status IN ('repair_scheduled','waiting_for_assignment')
        ) AS pending_repairs,

        -- today repair count
        (
          SELECT COUNT(*)
          FROM appointments
          WHERE owner_id = $1
            AND appointment_type = 'repair'
            AND created_at::date = CURRENT_DATE
        ) AS today_repairs,

        -- unpaid repairs
        (
          SELECT COUNT(*)
          FROM appointments
          WHERE owner_id = $1
            AND appointment_type = 'repair'
            AND payment_status IS DISTINCT FROM 'paid'
        ) AS unpaid_repairs,

        -- revenue last 30 days
        (
          SELECT COALESCE(SUM(final_cost),0)
          FROM appointments
          WHERE owner_id = $1
            AND payment_status = 'paid'
            AND updated_at >= now() - interval '30 days'
        ) AS revenue_30d
      `,
      [ownerId]
    );

    const row = result.rows[0];

    return res.json({
      todayDiagnosis: Number(row.today_diagnosis),
      pendingRepairs: Number(row.pending_repairs),
      todayRepairs: Number(row.today_repairs),
      unpaidRepairs: Number(row.unpaid_repairs),
      revenueLast30Days: Number(row.revenue_30d)
    });

  } catch (err) {
    console.error("Dashboard summary error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
