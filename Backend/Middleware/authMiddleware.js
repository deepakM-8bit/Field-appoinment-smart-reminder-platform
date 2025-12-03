import jwt from "jsonwebtoken";

 const authenticate = (req,res,next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer")){
        return res.status(401).json({error:"no token found"});
    }

    const token = authHeader.split(" ")[1];

    try{

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log(req.user);
        next();

    }catch(err){
        console.log("jwt verification error:",err.message)
        return res.status(403).json({message:"token invalid"})
    }
}

export default authenticate;