import pool from "../db.js";

//get all technicians
export const getTechnicians = async (req,res) => {
    const userId = req.user.id;
    try{
        const result = await pool.query("SELECT * FROM technicians WHERE owner_id=$1 ORDER BY id ASC",[userId]);
        res.json(result.rows);
    }catch(err){
        console.error("database error:",err.message)
        res.status(500).json({error:err.message});
    }
}

//add technicians
export const  addTechnicians = async(req,res) => {
    const {name,phoneno,email,category,WST,WET,active} = req.body;
    const userId = req.user.id;
    console.log(req.body);

    try{
        const result = await pool.query("INSERT INTO technicians (name,phone,email,category,work_start_time,work_end_time,active,owner_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
            [name,phoneno,email,category,WST,WET,active,userId]
        );
        res.json(result.rows);
        console.log(result.rows);
    }catch(err){
        console.error("database error:",err.message);
        res.status(500).json({error:err.message});
    }
}

// update technicians
export const updateTechnician = async (req,res) => {
    const {id} = req.params;
    const {name,phoneno,email,category,WST,WET,active} = req.body;
    const userId = req.user.id;

    try{
        const result = await pool.query("UPDATE technicians SET name=$1,phone=$2,category=$3,work_start_time=$4,work_end_time=$5,active=$6,email=$7 WHERE id=$8 AND owner_id=$9 RETURNING *",
            [name,phoneno,category,WST,WET,active,email,id,userId]
        );
        res.json(result.rows[0]);
    }catch(err){
        console.error("database error:",err.message);
        res.status(500).json({error:err.message});
    }
}

//delete technicians
export const deleteTechnicians = async (req,res) => {
    const {id} = req.params;

    try{
        const result = await pool.query("DELETE FROM technicians WHERE id=$1",[id]);
        res.json({message:"technician deleted"});
    }catch(err){
        res.status(500).json({error:err.message});
    }
}