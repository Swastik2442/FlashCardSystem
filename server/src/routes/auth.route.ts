import express from "express";
import { check, oneOf } from "express-validator";
import { Register, Login, Logout, RefreshAccessToken, ChangeUsername, ChangeEmail, ChangePassword, DeleteUser, GetUserAccessibleRoles, GetUserRoles, SetUserRoles } from "../controllers/auth.controller";
import Validate from "../middlewares/validate.middleware";
import { VerifyJWT } from "../middlewares/auth.middleware";
import { UserAccessibleRoles } from "../featureFlags";

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
    check("email")
        .isEmail()
        .withMessage("Invalid Email Address")
        .normalizeEmail(),
    check("username")
        .notEmpty()
        .withMessage("Username is required")
        .trim()
        .isLength({ min: 2, max: 32 })
        .withMessage("Must be at least 2 Characters and at most 32 Characters long")
        .toLowerCase()
        .matches(/^[a-z0-9_]+$/)
        .withMessage("Can only contain lowercase letters, numbers, and underscores")
        .escape(),
    check("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8, max: 64 })
        .withMessage("Must be at least 8 Characters and at most 64 Characters long"),
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
    ], "Either username or email is required"),
    check("password")
        .notEmpty()
        .withMessage("Password is required"),
    Validate,
    Login,
);

router.get("/logout", VerifyJWT, Logout);
router.get("/refresh-token", RefreshAccessToken);

router.delete(
    "/delete",
    VerifyJWT,
    check("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8, max: 64 })
        .withMessage("Must be at least 8 Characters and at most 64 Characters long"),
    Validate,
    DeleteUser
);

router.patch(
    "/edit/username",
    VerifyJWT,
    check("username")
        .notEmpty()
        .withMessage("Username is required")
        .trim()
        .isLength({ min: 2, max: 32 })
        .withMessage("Must be at least 2 Characters and at most 32 Characters long")
        .toLowerCase()
        .matches(/^[a-z0-9_]+$/)
        .withMessage("Can only contain lowercase letters, numbers, and underscores")
        .escape(),
    check("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8, max: 64 })
        .withMessage("Must be at least 8 Characters and at most 64 Characters long"),
    Validate,
    ChangeUsername
);

router.patch(
    "/edit/email",
    VerifyJWT,
    check("email")
        .isEmail()
        .withMessage("Invalid Email Address")
        .normalizeEmail(),
    check("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8, max: 64 })
        .withMessage("Must be at least 8 Characters and at most 64 Characters long"),
    Validate,
    ChangeEmail
);

router.patch(
    "/edit/password",
    VerifyJWT,
    check("oldPassword")
        .notEmpty()
        .withMessage("Old Password is required")
        .isLength({ min: 8, max: 64 })
        .withMessage("Must be at least 8 Characters and at most 64 Characters long"),
    check("newPassword")
        .notEmpty()
        .withMessage("New Password is required")
        .isLength({ min: 8, max: 64 })
        .withMessage("Must be at least 8 Characters and at most 64 Characters long"),
    Validate,
    ChangePassword
);

router.get("/roles/all", VerifyJWT, GetUserAccessibleRoles);
router.get("/roles", VerifyJWT, GetUserRoles);

router.patch(
    "/roles",
    VerifyJWT,
    check("roles")
        .custom((obj) => {
            if (typeof obj !== "object" || Array.isArray(obj) || obj === null)
                throw new Error("Roles must be an object");
            for (const key of Object.keys(obj)) {
                if (typeof obj[key] !== "boolean")
                    throw new Error(`Role value for '${key}' must be boolean`);
                if (!UserAccessibleRoles.includes(key as typeof UserAccessibleRoles[number]))
                    throw new Error(`Invalid role: ${key}`);
            }
            return true;
        }),
    Validate,
    SetUserRoles
);

export default router;
