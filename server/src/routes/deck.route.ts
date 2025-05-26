import express from "express";
import { check, oneOf } from "express-validator";
import Ratelimiter from "@/middlewares/ratelimit.middleware";
import Validate from "@/middlewares/validate.middleware";
import {
    VerifyJWT,
    AllowUser,
    AllowUserFor
} from "@/middlewares/auth.middleware";
import {
    CreateDeck,
    GetDeck,
    DeleteDeck,
    UpdateDeck,
    PopulateDeck,
    GetAllDecks,
    ShareDeck,
    GetDeckLikes,
    LikeDeck,
    UnlikeDeck,
    GetDeckCards,
    ChangeDeckOwner
} from "@/controllers/deck.controller";
import {
    createDeckIdChain,
    createUsernameChain
} from "@/utils/validationChains";

const router = express.Router();
router.use(VerifyJWT);
router.use(AllowUser);

router.get("/all", GetAllDecks);

router.post(
    "/new",
    check("name")
        .notEmpty()
        .withMessage("Name is required")
        .trim()
        .isLength({ min: 3, max: 64 })
        .withMessage("Must be at least 3 Characters and at most 64 Characters long")
        .escape(),
    check("description")
        .trim()
        .isLength({  max: 256 })
        .withMessage("Must be at most 256 Characters long")
        .escape(),
    check("isPrivate")
        .isBoolean()
        .withMessage("Private must be a boolean"),
    Validate,
    CreateDeck
);

router.get(
    "/populate/:did",
    (...params) => AllowUserFor("GEN_AI", ...params),
    createDeckIdChain(),
    Validate,
    Ratelimiter,
    PopulateDeck
);

router.get("/:did", createDeckIdChain(), Validate, GetDeck);
router.delete("/:did", createDeckIdChain(), Validate, DeleteDeck);

router.patch(
    "/:did",
    createDeckIdChain(),
    oneOf([
        check("name")
            .notEmpty()
            .trim()
            .isLength({ min: 3, max: 64 })
            .escape(),
        check("description")
            .trim()
            .isLength({ max: 256 })
            .escape(),
        check("isPrivate")
            .isBoolean(),
    ], { message: "At least one field is required" }),
    Validate,
    UpdateDeck
);

router.get("/cards/:did", createDeckIdChain(), Validate, GetDeckCards);

router.patch("/owner/:did", createDeckIdChain(), createUsernameChain("user"), Validate, ChangeDeckOwner)

router.post(
    "/share/:did",
    createDeckIdChain(),
    createUsernameChain("user"),
    check("isEditable").isBoolean(),
    Validate,
    ShareDeck
);

router.post(
    "/unshare/:did",
    createDeckIdChain(),
    createUsernameChain("user"),
    check("unshare")
        .notEmpty()
        .withMessage("Setting an unshare variable is required"),
    Validate,
    ShareDeck
);

router.get("/likes/:did", createDeckIdChain(), Validate, GetDeckLikes);

router.post("/likes/add/:did", createDeckIdChain(), Validate, LikeDeck);

router.post("/likes/remove/:did", createDeckIdChain(), Validate, UnlikeDeck);

export default router;
