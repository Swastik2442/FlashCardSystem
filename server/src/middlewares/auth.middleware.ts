import { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from "express";
import jwt from "jsonwebtoken"
import User from "../models/user.model";
import { canUseFeature } from "../featureFlags";
import type { FeatureFlagName } from "../featureFlags";
import { ACCESS_TOKEN_COOKIE_NAME } from "../constants";
import env from "../env";

/**
 * @desc Verifies the Access Token and adds User param to Request
 * @access private
 */
export async function VerifyJWT(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
    try {
        const token = req.signedCookies[ACCESS_TOKEN_COOKIE_NAME] ?? req.header("Authorization")?.replace("Bearer ", "");
        if (!token)
            throw new Error("Unauthorized Request");

        const decodedToken = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(
            (decodedToken as jwt.JwtPayload)?._id
        ).select("-password -refreshToken -__v");
        if (!user)
            throw new Error("Invalid Access Token");

        req.user = user;
        next();
    } catch (err: unknown) {
        res.status(401).json({
            status: "error",
            message: err instanceof Error ? err.message : "Internal Server Error",
            data: null,
        });
        res.end();
    }
}

/**
 * @desc Checks whether the User is Allowed to use the Application
 * @access public
 */
export function AllowUser(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
    try {
        if (!(req.user))
            throw new Error("Unknown User");
        if (!canUseFeature("IS_USER_ALLOWED", req.user))
            throw new Error("Access has been Revoked");
        next();
    } catch (err: unknown) {
        res.status(401).json({
            status: "error",
            message: err instanceof Error ? err.message : "Internal Server Error",
            data: null,
        });
        res.end();
    }
}

/**
 * @desc Checks whether the User is Allowed as per a Feature Flag
 * @access public
 */
export function AllowUserFor(feature: FeatureFlagName, req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
    try {
        if (!(req.user))
            throw new Error("Unknown User");
        if (!canUseFeature(feature, req.user))
            throw new Error("Feature not Allowed");
        next();
    } catch (err: unknown) {
        res.status(401).json({
            status: "error",
            message: err instanceof Error ? err.message : "Internal Server Error",
            data: null,
        });
        res.end();
    }
}
