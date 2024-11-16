import express from "express";
import { check, oneOf } from "express-validator";
import { Register, Login, Logout, RefreshAccessToken, ChangeUsername, ChangeEmail, ChangePassword, DeleteUser } from "../controllers/auth.controller";
import Validate from "../middlewares/validate.middleware";
import { VerifyJWT } from "../middlewares/auth.middleware";

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
        .isLength({ min: 8, max: 128 })
        .withMessage("Must be at least 8 Characters and at most 128 Characters long"),
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
    ], "Any one of username or email is required"),
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
        .isLength({ min: 8, max: 128 })
        .withMessage("Must be at least 8 Characters and at most 128 Characters long"),
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
        .isLength({ min: 8, max: 128 })
        .withMessage("Must be at least 8 Characters and at most 128 Characters long"),
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
        .isLength({ min: 8, max: 128 })
        .withMessage("Must be at least 8 Characters and at most 128 Characters long"),
    Validate,
    ChangeEmail
);

router.patch(
    "/edit/password",
    VerifyJWT,
    check("oldPassword")
        .notEmpty()
        .withMessage("Old Password is required")
        .isLength({ min: 8, max: 128 })
        .withMessage("Must be at least 8 Characters and at most 128 Characters long"),
    check("newPassword")
        .notEmpty()
        .withMessage("New Password is required")
        .isLength({ min: 8, max: 128 })
        .withMessage("Must be at least 8 Characters and at most 128 Characters long"),
    Validate,
    ChangePassword
);

export default router;
