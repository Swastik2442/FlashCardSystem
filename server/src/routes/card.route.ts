import express from "express";
import { check, oneOf } from "express-validator";
import Ratelimiter from "@/middlewares/ratelimit.middleware.js";
import Validate from "@/middlewares/validate.middleware.js";
import {
    VerifyJWT,
    AllowUser,
    AllowUserFor
} from "@/middlewares/auth.middleware.js";
import {
    CreateCard,
    GetCard,
    PopulateCard,
    DeleteCard,
    UpdateCard
} from "@/controllers/card.controller.js";
import { createCardIdChain } from "@/utils/validationChains.js";

const router = express.Router();
router.use(VerifyJWT);
router.use(AllowUser);

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
    "/populate/:cid",
    (...params) => AllowUserFor("GEN_AI", ...params),
    createCardIdChain(),
    Validate,
    Ratelimiter,
    PopulateCard
);

router.get("/:cid", createCardIdChain(), Validate, GetCard);

router.delete("/:cid", createCardIdChain(), Validate, DeleteCard);

router.patch(
    "/:cid",
    createCardIdChain(),
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
    ], { message: "At least one field is required" }),
    Validate,
    UpdateCard
);

export default router;
