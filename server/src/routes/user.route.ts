import express from "express";
import { check, oneOf } from "express-validator";
import Validate from "../middlewares/validate.middleware";
import { VerifyJWT } from "../middlewares/auth.middleware";
import { GetUser, GetUserSub, GetLikedDecks, GetUserDecks, UpdateUser } from "../controllers/user.controller";

const router = express.Router();
router.use(VerifyJWT);

router.get("/", (req, res) => {
    res.redirect("/user/get/" + encodeURIComponent(req.user!.username));
});

router.get(
    "/get/:username",
    check("username")
        .notEmpty()
        .withMessage("Username is required")
        .trim()
        .isLength({ min: 2, max: 32 })
        .withMessage("Must be at least 2 Characters and at most 32 Characters long")
        .matches(/^[a-z0-9_]+$/)
        .withMessage("Can only contain lowercase letters, numbers, and underscores")
        .escape(),
    Validate,
    GetUser
);

router.get(
    "/getsub/:str",
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

router.patch(
    "/edit",
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

export default router;
