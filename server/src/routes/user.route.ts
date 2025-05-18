import express from "express";
import { check, oneOf } from "express-validator";
import Validate from "../middlewares/validate.middleware";
import { VerifyJWT } from "../middlewares/auth.middleware";
import { GetUserPrivate, GetUser, GetUserSub, GetLikedDecks, GetUserDecks, UpdateUser, GetUserAccessibleRoles, GetUserRoles, SetUserRoles } from "../controllers/user.controller";
import { UserAccessibleRoles } from "../featureFlags";

const router = express.Router();
router.use(VerifyJWT);

router.get("/", GetUserPrivate);

router.patch(
    "/",
    oneOf([
        check("fullName")
            .notEmpty()
            .trim()
            .isLength({ min: 3, max: 64 })
            .escape(),
    ], "At least one field is required"),
    Validate,
    UpdateUser
);

router.get(
    "/get/:username",
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
    Validate,
    GetUser
);

router.get(
    "/substr/:str",
    check("str")
        .notEmpty()
        .withMessage("str is required")
        .trim()
        .isLength({ min: 2, max: 32 })
        .withMessage("Must be at least 2 Characters and at most 32 Characters long")
        .toLowerCase()
        .matches(/^[a-z0-9_]+$/)
        .withMessage("Can only contain lowercase letters, numbers, and underscores")
        .escape(),
    Validate,
    GetUserSub
);

router.get(
    "/decks/:username",
    check("username")
        .notEmpty()
        .withMessage("Username is required")
        .trim()
        .isLength({ min: 2, max: 32 })
        .withMessage("Must be at least 2 Characters and at most 32 Characters long")
        .toLowerCase()
        .matches(/^[a-z0-9_]+$/)
        .escape(),
    Validate,
    GetUserDecks
);

router.get("/liked", GetLikedDecks);

router.get("/roles/all", GetUserAccessibleRoles);
router.get("/roles", GetUserRoles);

router.patch(
    "/roles",
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
