import express from "express";
import { check } from "express-validator";
import Validate from "../middlewares/validate.middleware";
import { VerifyJWT } from "../middlewares/auth.middleware";
import { GetUser, GetLikedDecks } from "../controllers/user.controller";

const router = express.Router();
router.use(VerifyJWT);

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

router.get("/liked", GetLikedDecks);

export default router;
