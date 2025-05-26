import {
    Request as ExpressRequest,
    Response as ExpressResponse,
    NextFunction
} from "express";
import jwt from "jsonwebtoken"
import User from "@/models/user.model";
import { canUseFeature } from "@/featureFlags";
import type { FeatureFlagName } from "@/featureFlags";
import { ACCESS_TOKEN_COOKIE_NAME } from "@/constants";
import env from "@/env";

/**
 * @desc Gets the Access Token from the Request
 * @access private
 */
export const getAccessToken = (req: ExpressRequest) => {
    return req.signedCookies[ACCESS_TOKEN_COOKIE_NAME] ?? req.header("Authorization")?.replace("Bearer ", "");
}

/**
 * @desc Verifies the Access Token to be valid and signed by server, and returns the decoded object
 * @access private
 */
export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, env.ACCESS_TOKEN_SECRET);
}

/**
 * @desc Verifies the Access Token and adds User param to Request
 * @access private
 */
export async function VerifyJWT(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
    try {
        const token = getAccessToken(req);
        if (!token)
            throw new Error("Unauthorized Request");

        const decodedToken = verifyAccessToken(token);
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

/**
 * @desc Checks whether the User is Allowed to use the Application
 * @access public
 */
export function AllowUser(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
    return AllowUserFor("IS_USER_ALLOWED", req, res, next);
}
