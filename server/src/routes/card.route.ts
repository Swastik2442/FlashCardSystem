import express from "express";
import { check, oneOf } from "express-validator";
import Validate from "../middlewares/validate.middleware";
import { VerifyJWT } from "../middlewares/auth.middleware";
import { CreateCard, GetCard, DeleteCard, UpdateCard } from "../controllers/card.controller";

const router = express.Router();
router.use(VerifyJWT);

router.post(
    "/new",
    check("question")
    .notEmpty()
    .withMessage("Question is required")
    .trim()
    .escape(),
    check("answer")
    .notEmpty()
    .withMessage("Answer is required")
    .trim()
    .escape(),
    check("hint")
    .trim()
    .escape(),
    check("deck")
    .notEmpty()
    .withMessage("Deck is required")
    .trim()
    .escape(),
    Validate,
    CreateCard
);

router.get(
    "/:cid",
    check("cid")
    .notEmpty()
    .withMessage("Card ID is required")
    .trim()
    .escape(),
    Validate,
    GetCard
);

router.delete(
    "/:cid",
    check("cid")
    .notEmpty()
    .withMessage("Card ID is required")
    .trim()
    .escape(),
    Validate,
    DeleteCard
);

router.patch(
    "/:cid",
    check("cid")
    .notEmpty()
    .withMessage("Card ID is required")
    .trim()
    .escape(),
    oneOf([
        check("question")
        .notEmpty()
        .trim()
        .escape(),
        check("answer")
        .notEmpty()
        .trim()
        .escape(),
        check("hint")
        .notEmpty()
        .trim()
        .escape(),
        check("deck")
        .notEmpty()
        .trim()
        .escape(),
    ], "At least one field is required"),
    Validate,
    UpdateCard
);

export default router;
