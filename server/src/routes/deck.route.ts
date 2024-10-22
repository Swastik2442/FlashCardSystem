import express from "express";
import { check } from "express-validator";
import Validate from "../middlewares/validate.middleware";
import { VerifyJWT } from "../middlewares/auth.middleware";
import { CreateDeck, GetDeck, DeleteDeck, UpdateDeck, GetAllDecks, ShareDeck, GetDeckLikes, LikeDeck, UnlikeDeck } from "../controllers/deck.controller";

const router = express.Router();
router.use(VerifyJWT);

router.post(
    "/new",
    check("name")
    .notEmpty()
    .withMessage("Name is required")
    .trim()
    .escape(),
    check("description")
    .trim()
    .escape(),
    check("isPrivate")
    .isBoolean()
    .withMessage("Private must be a boolean"),
    Validate,
    CreateDeck
);

router.get("/all", GetAllDecks);

router.get(
    "/:did",
    check("did")
    .notEmpty()
    .withMessage("Deck ID is required")
    .trim()
    .escape(),
    Validate,
    GetDeck
);
router.delete(
    "/:did",
    check("did")
    .notEmpty()
    .withMessage("Deck ID is required")
    .trim()
    .escape(),
    Validate,
    DeleteDeck
);

router.patch(
    "/:did",
    check("did")
    .notEmpty()
    .withMessage("Deck ID is required")
    .trim()
    .escape(),
    Validate,
    UpdateDeck
);

router.post(
    "/share/:did",
    check("did")
    .notEmpty()
    .withMessage("Deck ID is required")
    .trim()
    .escape(),
    check("username")
    .notEmpty()
    .withMessage("Username is required")
    .trim()
    .escape(),
    check("isEditable")
    .isBoolean(),
    Validate,
    ShareDeck
);

router.get(
    "/likes/:did",
    check("did")
    .notEmpty()
    .withMessage("Deck ID is required")
    .trim()
    .escape(),
    Validate,
    GetDeckLikes
);

router.post(
    "/likes/add/:did",
    check("did")
    .notEmpty()
    .withMessage("Deck ID is required")
    .trim()
    .escape(),
    Validate,
    LikeDeck);

router.post(
    "/likes/remove/:did",
    check("did")
    .notEmpty()
    .withMessage("Deck ID is required")
    .trim()
    .escape(),
    Validate,
    UnlikeDeck
);

export default router;
