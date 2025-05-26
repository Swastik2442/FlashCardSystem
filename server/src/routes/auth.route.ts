import express from "express";
import { check, oneOf } from "express-validator";
import {
    Register,
    Login,
    Logout,
    RefreshAccessToken,
    ChangeUsername,
    ChangeEmail,
    ChangePassword,
    DeleteUser
} from "@/controllers/auth.controller";
import Validate from "@/middlewares/validate.middleware";
import { VerifyJWT } from "@/middlewares/auth.middleware";
import {
    createEmailChain,
    createPasswordChain,
    createUsernameChain
} from "@/utils/validationChains";

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

router.use(VerifyJWT);
router.get("/logout", Logout);

router.delete("/delete", createPasswordChain(), Validate, DeleteUser);

router.patch("/edit/username", createUsernameChain(), createPasswordChain(), Validate, ChangeUsername);

router.patch("/edit/email", createEmailChain(), createPasswordChain(), Validate, ChangeEmail);

router.patch("/edit/password", createPasswordChain("oldPassword"), createPasswordChain("newPassword"), Validate, ChangePassword);

export default router;
