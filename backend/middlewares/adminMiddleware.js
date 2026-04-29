import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const adminMiddleware = async(req,res,next)=>{
    try {
        const token = req.header("auth-token");

        if(!token){
            return res.status(401).json({message:"Unauthorized"})
        }

        const user = jwt.verify(token,JWT_SECRET);

        if(!user){
            return res.status(401).json({message:"Unauthorized"})
        }

        req.user = user;
        if(user.userId === process.env.ADMIN_ID && user.role === 'Admin'){
            next();
        }else{
            return res.status(401).json({message:"Unauthorized"})
        }
    } catch (error) {
        return res.status(401).json({message:"Unauthorized"})
    }
}