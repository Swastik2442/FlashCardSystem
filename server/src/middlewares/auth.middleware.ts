import type {
    Request as ExpressRequest,
    Response as ExpressResponse,
    NextFunction
} from "express";
import { getSession } from "@auth/express";

import User from "@/models/user.model";
import { canUseFeature, type FeatureFlagName } from "@/lib/featureFlags";
import authConfig from "@/config/auth.config";

/**
 * @desc Verifies the Access Token and adds User param to Request
 * @access private
 */
export async function VerifyUser(req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
    if (!req.locals)
        req.locals = { session: null, roles: null }
    if (!req.locals.session)
        req.locals.session = await getSession(req, authConfig);

    if (!req.locals?.session?.user) {
        res.status(401).json({
            status: "error",
            message: "Unauthorized Request",
            data: null
        });
        res.end();
    } else
        next();
}

export const getSessionID = (req: ExpressRequest) => {
    const userID = req.locals?.session?.user?.id;
    if (!userID) throw 401;
    return userID;
}

/**
 * @desc Checks whether the User is Allowed as per a Feature Flag
 * @access public
 */
export async function AllowUserFor(feature: FeatureFlagName, req: ExpressRequest, res: ExpressResponse, next: NextFunction) {
    try {
        if (!req.locals)
            req.locals = { session: null, roles: null }
        if (!req.locals.session)
            req.locals.session = await getSession(req, authConfig);
        if (!req.locals.roles) {
            if (!(req.locals.session?.user?.id))
                throw new Error("Unknown User");
            const user = await User.findById(req.locals.session?.user?.id).select("roles");
            if (!user) throw new Error("Unknown User");

            req.locals.roles = user.roles;
        }

        if (!canUseFeature(feature, {
            id: req.locals.session!.user!.id!,
            roles: req.locals.roles
        })) throw new Error("Feature not Allowed");
        next();
    } catch (err) {
        res.status(401).json({
            status: "error",
            message: err instanceof Error ? err.message : "Internal Server Error",
            data: null
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
