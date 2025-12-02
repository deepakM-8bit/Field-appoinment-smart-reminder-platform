import pool from "../db.js";

//get all technicians
export const getTechnicians = async (req,res) => {
    try{
        const result = await pool.query("SELECT * FROM technicians ORDER BY id ASC");
        res.json(result.rows[0]);
    }catch(err){
        console.error("database error:",err.message)
        res.status(500).json({error:err.message});
    }
}

//add technicians
export const  addTechnicians = async(req,res) => {
    const {name,phoneno,category,WST,WET,active} = req.body;

    try{
        const result = await pool.query("INSERT INTO technicians (name,phone,category,work_start_time,work_end_time,active) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
            [name,phoneno,category,WST,WET,active]
        );
        res.json(result.rows);
    }catch(err){
        console.error("database error:",err.message);
        res.status(500).json({error:err.message});
    }
}