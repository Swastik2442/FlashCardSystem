import express from "express";
import { check } from "express-validator";
import Validate from "../middlewares/validate.middleware";
import { VerifyJWT } from "../middlewares/auth.middleware";
import { GetUser, GetUserSub, GetLikedDecks, GetUserDecks } from "../controllers/user.controller";

const router = express.Router();
router.use(VerifyJWT);

router.get("/", (req, res) => {
    res.redirect("/user/get/" + encodeURIComponent(req.user.username));
});

router.get(
    "/get/:username",
    check("username")
    .notEmpty()
    .withMessage("Username is required")
    .trim()
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
    .escape(),
    Validate,
    GetUserDecks
);

router.get("/liked", GetLikedDecks);

export default router;
