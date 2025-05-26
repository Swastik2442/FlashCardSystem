import { check } from "express-validator";

export const createCardIdChain = () => check("cid").notEmpty().withMessage("Card ID is required").trim().escape()

export const createDeckIdChain = () => check("did").notEmpty().withMessage("Deck ID is required").trim().escape();

export const createUsernameChain = (value = "username") => check(value)
    .notEmpty()
    .withMessage(value + " is required")
    .trim()
    .isLength({ min: 2, max: 32 })
    .withMessage("Must be at least 2 Characters and at most 32 Characters long")
    .toLowerCase()
    .matches(/^[a-z0-9_]+$/)
    .withMessage("Can only contain lowercase letters, numbers, and underscores")
    .escape();

export const createEmailChain = () => check("email")
    .isEmail()
    .withMessage("Invalid Email Address")
    .normalizeEmail()

export const createPasswordChain = (value = "password") => check(value)
    .notEmpty()
    .withMessage(value + " is required")
    .isLength({ min: 8, max: 64 })
    .withMessage("Must be at least 8 Characters and at most 64 Characters long")
