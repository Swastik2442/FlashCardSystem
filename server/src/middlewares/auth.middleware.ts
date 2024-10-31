import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from "express";
import jwt from "jsonwebtoken"
import User from "../models/user.model";
import env from "../env";

/**
 * @desc Verifies the Access Token and adds User param to Request
 * @access private
 */
export async function VerifyJWT(req: ExpressRequest, _res: ExpressResponse, next: NextFunction) {
    try {
        const token = req.cookies?.access_token || req.header("Authorization")?.replace("Bearer ", "");
        if (!token)
            throw new Error("Unauthorized Request")
    
        const decodedToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
        const user = await User.findById((decodedToken as jwt.JwtPayload)?._id).select("-password -refreshToken");
        if (!user)            
            throw new Error("Invalid Access Token");
    
        req.user = user;
        next();
    } catch (err: any) {
        next(err?.message || "Internal Server Error");
    }   
}
