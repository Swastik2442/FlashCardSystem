import express from "express";
import { check, oneOf } from "express-validator";
import { doubleCsrf } from "csrf-csrf";

import {
    Register,
    Login,
    Logout,
    RefreshAccessToken,
    ChangeUsername,
    ChangeEmail,
    ChangePassword,
    DeleteUser
} from "../controllers/auth.controller.js";
import Validate from "../middlewares/validate.middleware.js";
import {
    VerifyJWT,
    getSessionID,
} from "../middlewares/auth.middleware.js";
import {
    createEmailChain,
    createPasswordChain,
    createUsernameChain
} from "../utils/validationChains.js";
import { CSRF_COOKIE_NAME } from "../constants.js";
import env from "../env.js";

const router = express.Router();

router.post(
    "/register",
    check("fullName")
        .notEmpty()
        .withMessage("Full Name is required")
        .trim()
        .isLength({ min: 3, max: 64 })
        .withMessage("Must be at least 3 Characters and at most 64 Characters long")
        .escape(),
    createEmailChain(),
    createUsernameChain(),
    createPasswordChain(),
    Validate,
    Register,
);

router.post(
    "/login",
    oneOf([
        check("username")
            .notEmpty()
            .trim()
            .isLength({ min: 2, max: 32 })
            .toLowerCase()
            .matches(/^[a-z0-9_]+$/)
            .escape(),
        check("email")
            .isEmail()
            .normalizeEmail(),
    ], { message: "Either username or email is required" }),
    check("password")
        .notEmpty()
        .withMessage("Password is required"),
    Validate,
    Login,
);

router.get("/refresh-token", RefreshAccessToken);

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

router.use(VerifyJWT);
router.get("/logout", Logout);

router.delete("/delete", createPasswordChain(), Validate, DeleteUser);

router.patch("/edit/username", createUsernameChain(), createPasswordChain(), Validate, ChangeUsername);

router.patch("/edit/email", createEmailChain(), createPasswordChain(), Validate, ChangeEmail);

router.patch("/edit/password", createPasswordChain("oldPassword"), createPasswordChain("newPassword"), Validate, ChangePassword);

export default router;
