import pool from "../db.js";
import bcrypt from "bcryptjs";

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
    const {name,phoneno,email,category,WST,WET,active,password} = req.body;
    const userId = req.user.id;
    console.log(req.body);

    try{
        const hashedPassword = await bcrypt.hash(password,10);
        const result = await pool.query("INSERT INTO technicians (name,phone,email,category,work_start_time,work_end_time,active,owner_id,password) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
            [name,phoneno,email,category,WST,WET,active,userId,hashedPassword]
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
    const {name,phoneno,email,category,WST,WET,active,password} = req.body;
    const userId = req.user.id;

    try{
        let query;
        let values;

        if(password) {
            const hashedPassword = await bcrypt.hash(password,10);
            query= `
              UPDATE technicians
              SET name=$1, phone=$2, email=$3, category=$4,
                  work_start_time=$5, work_end_time=$6, active=$7, password=$8
              WHERE id=$9 AND owner_id=$10
              RETURNING *
            `;
            values = [
                name, phoneno, email, category,
                WST, WET, active, hashedPassword,
                id, userId
            ];
        } else {
            query = `
              UPDATE technicians
              SET name=$1, phone=$2, email=$3, category=$4,
                  work_start_time=$5, work_end_time=$6, active=$7
              WHERE id=$8 AND owner_id=$9
              RETURNING *
            `;
            values = [
                name, phoneno, email, category,
                WST, WET, active,
                id, userId
            ];
        }
        
        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    }catch(err){
        console.error("database error:",err.message);
        res.status(500).json({error:err.message});
    }
};

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