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
        .isLength({ min: 3, max: 128 })
        .withMessage("Must be at least 3 Characters and at most 128 Characters long")
        .escape(),
    check("answer")
        .notEmpty()
        .withMessage("Answer is required")
        .trim()
        .isLength({ min: 3, max: 128 })
        .withMessage("Must be at least 3 Characters and at most 128 Characters long")
        .escape(),
    check("hint")
        .trim()
        .isLength({ max: 64 })
        .withMessage("Must be at most 64 Characters long")
        .escape(),
    check("deck")
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
            .isLength({ min: 3, max: 128 })
            .escape(),
        check("answer")
            .notEmpty()
            .trim()
            .isLength({ min: 3, max: 128 })
            .escape(),
        check("hint")
            .notEmpty()
            .trim()
            .isLength({ max: 64 })
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
