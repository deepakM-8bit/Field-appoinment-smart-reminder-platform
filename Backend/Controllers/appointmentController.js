import pool from "../db";

//admin create appointment (diagnosis/repair)
export const createAppointment = async(req,res)=>{

};

//admin can view appoinment list
export const listAppointment = async (req,res) => {
export const addCustomer = async (req,res) => {
    const {name,phoneno,address} = req.body;
    const userId = req.user.id;

    try{
         const existing = await pool.query("SELECT * FROM customers WHERE owner_id=$1 AND phone=$2",[userId,phoneno]);
         if(existing.rows.length) return res.json(existing.rows[0]);

         const result = await pool.query("INSERT INTO customers (name,phone,address,owner_id) VALUES ($1,$2,$3,$4) RETURNING *",
            [name,phoneno,address,userId]
        );
        res.json(result.rows[0]);
    }catch(err){
        console.error("database error:",err.message);
        res.status(500).json({message:err.message});
    }
    
}
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