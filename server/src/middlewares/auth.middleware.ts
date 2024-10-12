import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from "express";
import jwt from "jsonwebtoken"
import User from "../models/user.model";

/**
 * @desc Verifies the Access Token and adds User param to Request
 * @access private
 */
export async function VerifyJWT(req: ExpressRequest, _res: ExpressResponse, next: NextFunction) {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token)
            throw new Error("Unauthorized Request")
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
        const user = await User.findById((decodedToken as jwt.JwtPayload)?._id).select("-password -refreshToken");
        if (!user)            
            throw new Error("Invalid Access Token");
    
        req.user = user;
        next();
    } catch (err: any) {
        throw new Error(err?.message || "Internal Server Error");
    }   
}
