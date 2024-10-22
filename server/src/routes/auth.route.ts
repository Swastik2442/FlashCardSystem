import express from "express";
import { check, oneOf } from "express-validator";
import { Register, Login, Logout, RefreshAccessToken } from "../controllers/auth.controller";
import Validate from "../middlewares/validate.middleware";
import { VerifyJWT } from "../middlewares/auth.middleware";

const router = express.Router();

router.post(
    "/register",
    check("fullName")
    .notEmpty()
    .withMessage("Full Name is required")
    .trim()
    .escape(),
    check("email")
    .isEmail()
    .withMessage("Inalid Email Address")
    .normalizeEmail(),
    check("username")
    .notEmpty()
    .withMessage("Username is required")
    .trim()
    .escape(),
    check("password")
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage("Must be at least 8 Characters long"),
    Validate,
    Register,
);

router.post(
    "/login",
    oneOf([
        check("username")
        .notEmpty()
        .trim()
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

export default router;
