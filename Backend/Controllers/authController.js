import pool from "../db.js";

export const signUpUser = async (req,res) => {
    const {name,email,password} = req.body;

    try{
        const result = await pool.query('SELECT * FROM users WHERE email=$1'[email]);
        if(result.rows>0){
            return res.status(404).json({message:"user already registered"});
        }
        const hashedPassword = await bcrypt.hash(password,10);

        const insertResult = await pool.query('INSERT INTO users (name,email,password) values ($1,$2,$3) RETURNING id',[name,email,hashedPassword]);
        res.status(200).json({message:"user registered successfully"});
    }catch(err){
        res.status(500).json(err.message);
    }

}

export const loginUser = async(req,res) => {
    const {email,password} = req.body;

    try{
        const result = await pool.query('SELECT * FROM users WHERE email=$1'[email]);
        if(result.rows === 0){
            res.status(404).json({message:"user not found"});
        }

        const user = result.rows[0];

        const valid = bcrypt.compare(password, user.password);
        if(!valid){
            return res.status(403).json({message:"incorrect password"});
        }
        
        const token = jwt.sign({id: user.id , email:user.email, name: user.name});
        res.json({
            message: "user found",
            token: token,
            user:{
                id:user.id,
                name:user.name,
                email:user.email
            }
        });
    }catch(err){
        res.status(500).json(err.message);
    }
}