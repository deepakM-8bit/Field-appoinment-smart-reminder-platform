import pool from "../db.js";

//get customer list
export const getCustomer = async (req,res) => {
    const userId = req.user.id;
    try{
        const result = await pool.query("SELECT * FROM customers WHERE owner_id=$1 ORDER BY id ASC",[userId]);
        res.json(result.rows);
    }catch(err){
        console.error("database error:",err.message);
        res.status(500).json({error:err.message});
    }
}