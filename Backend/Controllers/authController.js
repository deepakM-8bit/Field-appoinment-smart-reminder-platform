import pool from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signUpUser = async (req,res) => {
    const {name,email,password} = req.body;

    try{
        const result = await pool.query("SELECT * FROM users WHERE email=$1",[email]);
        if(result.rows.length>0){
            return res.status(404).json({message:"user already registered"});
        }
        const hashedPassword = await bcrypt.hash(password,10);

        const insertResult = await pool.query("INSERT INTO users (name,email,password) values ($1,$2,$3) RETURNING id",
            [name,email,hashedPassword]);
        res.status(200).json({userId: insertResult.rows[0].id,message:"user registered successfully"});
    }catch(err){
        res.status(500).json(err.message);
    }

}

export const loginUser = async(req,res) => {
    const {email,password} = req.body;

    try{
        const result = await pool.query("SELECT * FROM users WHERE email=$1",[email]);
        if(result.rows.length === 0){
            res.status(404).json({message:"user not found"});
        }

        const user = result.rows[0];
        
        const valid = await bcrypt.compare(password, user.password);
        if(!valid){
            return res.status(403).json({message:"incorrect password"});
        }
        
        const token = jwt.sign({id: user.id , email:user.email, name: user.name, role:user.role},
             process.env.JWT_SECRET);
        res.json({
            message: "user found",
            token: token,
            role: user.role,
            user:{
                id:user.id,
                name:user.name,
                email:user.email,
                role:user.role
            }
        });
        console.log({
            message:"user logged in",
            id:user.id,
            name:user.name,
            email:user.email,
            role:user.role})
    }catch(err){
        res.status(500).json(err.message);
    }
}

export const technicianLogin = async (req,res) => {
    const {name , phoneno} = req.body;

        if (!name || !phoneno) {
        return res.status(400).json({ message: "Name and phone number required" });
        }

    try{
        const result = await pool.query("SELECT * FROM technicians WHERE phone=$1",[phoneno]);

        if(result.rows.length === 0){
            res.status(404).json({message:"technician not found"});
        }

        const technician = result.rows[0];
        const token = jwt.sign({id: technician.id, name: technician.name, role:"technician"}, process.env.JWT_SECRET);
        console.log(technician);

        return res.json({
            message:"technician login successfully",
            role:"technician",
            token,
            technician:{
                id:technician.id,
                name:technician.name,
                category:technician.category,
                work_start_time:technician.work_start_time,
                work_end_time:technician.work_end_time
            },
        })
    }catch(err){
        console.error("technician login error:",err);
        return res.status(500).json({message:"server error"});
    }
}