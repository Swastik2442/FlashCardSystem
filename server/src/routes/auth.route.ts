import express from "express";
import { doubleCsrf } from "csrf-csrf";
import { ExpressAuth } from "@auth/express"

import {
    ChangeUsername,
    DeleteUser
} from "@/controllers/auth.controller";
import Validate from "@/middlewares/validate.middleware";
import {
    VerifyUser,
    getSessionID
} from "@/middlewares/auth.middleware";
import authConfig from "@/config/auth.config";
import {
    createPasswordChain,
    createUsernameChain
} from "@/utils/validationChains";
import { CSRF_COOKIE_NAME } from "@/constants";
import env from "@/env";

const router = express.Router();

router.use(
    "/v2/*",
    ExpressAuth(authConfig)
);

// CSRF Stuff
const { invalidCsrfTokenError, generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => env.CSRF_TOKEN_SECRET,
    getSessionIdentifier: getSessionID,
    cookieName: CSRF_COOKIE_NAME,
    cookieOptions: {
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    }
});

router.get("/csrf-token", (req, res) => {
    try {
        const token = generateCsrfToken(req, res, {
            validateOnReuse: true,
            overwrite: true
        });
        res.json({
            status: "success",
            message: "CSRF Token generated",
            data: token
        });
    } catch (err: unknown) {
        if (err == 401) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized Request",
                data: null
            });
        } else {
            console.log(err);
            res.status(500).json({
                status: "error",
                message: "Internal Server Error",
                data: null
            });
        }
    }
    res.end();
});

router.use(doubleCsrfProtection);
router.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err == invalidCsrfTokenError) {
        res.status(403).json({
            status: "error",
            message: "CSRF Validation failed"
        });
        res.end();
    } else {
        next();
    }
});

router.use(VerifyUser);
router.delete("/delete", createPasswordChain(), Validate, DeleteUser);

router.patch("/edit/username", createUsernameChain(), createPasswordChain(), Validate, ChangeUsername);

export default router;
