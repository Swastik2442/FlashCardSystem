import express from "express";
import { check } from "express-validator";
import Validate from "../middlewares/validate.middleware";
import { VerifyJWT } from "../middlewares/auth.middleware";
import { CreateDeck, GetDeck, DeleteDeck, UpdateDeck, GetAllDecks, ShareDeck, GetDeckLikes, LikeDeck, UnlikeDeck, GetDeckCards } from "../controllers/deck.controller";

const router = express.Router();
router.use(VerifyJWT);

router.get("/all", GetAllDecks);

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

router.get(
    "/cards/:did",
    check("did")
    .notEmpty()
    .withMessage("Deck ID is required")
    .trim()
    .escape(),
    Validate,
    GetDeckCards
);

router.post(
    "/share/:did",
    check("did")
    .notEmpty()
    .withMessage("Deck ID is required")
    .trim()
    .escape(),
    check("user")
    .notEmpty()
    .withMessage("User ID is required")
    .trim()
    .escape(),
    check("isEditable")
    .isBoolean(),
    Validate,
    ShareDeck
);

router.post(
    "/unshare/:did",
    check("did")
    .notEmpty()
    .withMessage("Deck ID is required")
    .trim()
    .escape(),
    check("user")
    .notEmpty()
    .withMessage("User ID is required")
    .trim()
    .escape(),
    check("unshare")
    .notEmpty()
    .withMessage("Setting an unshare variable is required"),
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
