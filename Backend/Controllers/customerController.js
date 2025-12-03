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

//add customer
export const addCustomer = async (req,res) => {
    const {name,phoneno,address} = req.body;
    const userId = req.user.id;

    try{
        const result = await pool.query("INSERT INTO customers (name,phone,address) VALUES ($1,$2,$3) WHERE owner_id=$4 RETURNING *",
            [name,phoneno,address,userId]
        );
        res.json(result.rows[0]);
    }catch(err){
        console.error("database error:",err.message);
        res.status(500).json({message:err.message});
    }
    
}