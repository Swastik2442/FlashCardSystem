import express from "express";
import { check, oneOf } from "express-validator";
import Validate from "@/middlewares/validate.middleware";
import { AllowUser, VerifyJWT } from "@/middlewares/auth.middleware";
import {
    GetUserPrivate,
    GetUser,
    GetUserSub,
    GetLikedDecks,
    GetUserDecks,
    UpdateUser,
    GetUserAccessibleRoles,
    GetUserRoles,
    SetUserRoles,
    GetUsers
} from "@/controllers/user.controller";
import { UserAccessibleRoles } from "@/featureFlags";
import { createUsernameChain } from "@/utils/validationChains";

const router = express.Router();
router.use(VerifyJWT);

router.get("/", GetUserPrivate);

router.use(AllowUser);

router.patch(
    "/",
    oneOf([
        check("fullName")
            .notEmpty()
            .trim()
            .isLength({ min: 3, max: 64 })
            .escape(),
    ], { message: "At least one field is required" }),
    Validate,
    UpdateUser
);

router.get("/get/:username", createUsernameChain(), Validate, GetUser);
router.get(
    "/get",
    oneOf([
        createUsernameChain("usernames"),
        [
            check("usernames")
                .isArray({ min: 1 })
                .withMessage("At least one User must be specified"),
            createUsernameChain("usernames.*")
        ]
    ]),
    Validate,
    GetUsers
);

router.get("/substr/:str", createUsernameChain("str"), Validate, GetUserSub);

router.get("/decks/:username", createUsernameChain(), Validate, GetUserDecks);

router.get("/liked/decks/:username", createUsernameChain(), GetLikedDecks);

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
