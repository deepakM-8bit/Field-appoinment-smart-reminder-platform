import pool from "../db";

function timeToMinutes(timestr){
    if(!timestr) return ;
    const [h,m,s] = timestr.split(":").map(Number);
    return (h||0 * 60 + (m||0));
}

//admin create appointment (diagnosis/repair)
export const createAppointment = async(req,res)=>{
    const {name,phoneno,address,category,sd,st} = req.body;
    const userId = req.user.id;

    if(!phoneno || !category || !sd || !st){
        return res.status(400).json({message:"missing input fields"});
    }

    const client = await pool.connect();

    try{
        await client.query("BEGIN");

        const existingCustomer = await pool.query("SELECT * FROM customers WHERE phone=$1 AND owner_id=$2",
            [phoneno,userId]   
        );

        let customer;
       
        if(!existingCustomer.rows.length === 0){
            const addCustomer = await pool.query("INSERT INTO customers (owner_id,name,phone,address) VALUES ($1,$2,$3,$4)",
                [userId,name,phoneno,address]);

                customer = addCustomer.rows[0];
        }else{
            customer = existingCustomer.rows[0];
        }

        const customerId = customer.id;

        const getTechnicians = await pool.query ("SELECT * FROM technicians WHERE owner_id=$1 AND category=$3 AND active=true ",
            [userId,category]
        );
        const technicians = getTechnicians.rows;

        let chosentechnician = null;

        if(technicians.length > 0){
            let bestTech = null;

            for(const tech of technicians){
                const workload = await client.query(`
                    SELECT COALESCE(SUM(estimated_duration_minutes),0)
                    AS minutes FROM appointments WHERE
                    technician_id=$1 AND scheduled_date=$2
                    AND status IN ('repair_scheduled','repair_in_progress')`,
                    [tech.id,sd]
                );

                const workloadMinutes = Number(workload.rows[0].minutes)||0;

                const workStartTime = timeToMinutes
            }
        }

    }catch(err){

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