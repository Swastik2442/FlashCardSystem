import { Request as ExpressRequest, Response as ExpressResponse } from "express";
import Deck from "../models/deck.model";
import Card from "../models/card.model";

/**
 * @route POST card/new
 * @desc Creates a new Card
 * @access public
 */
export async function CreateCard(req: ExpressRequest, res: ExpressResponse) {
    const { question, answer, hint, deck } = req.body;
    try {
        var deckById;
        if (!deck) {
            deckById = await Deck.findOne({ owner: req.user._id, name: "#UNCATEGORISED#" });
            if (!deckById) {
                deckById = await Deck.create({
                    owner: req.user._id,
                    name: "#UNCATEGORISED#",
                    isPrivate: true
                });
                deckById.save();
            }
        } else {
            deckById = await Deck.findById(deck);
            if (!deckById)
                throw new Error("Deck not found");
            else if (!deckById.isAccessibleBy(req.user._id).writable) {
                res.status(401).json({
                    status: "error",
                    message: "Unauthorized Operation",
                    data: null,
                });
                return;
            }
        }

        const newCard = await Card.create({
            question: question,
            answer: answer,
            hint: hint,
            deck: deckById._id,
        });

        const cardCheck = await Card.findById(newCard._id);
        if (!cardCheck)
            throw new Error("Card could not be created");

        deckById.dateUpdated = new Date();
        deckById.save();

        res.status(201).json({
            status: "success",
            message: "Card created successfully",
            data: newCard._id,
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
            data: null,
        });
    }
    res.end();
}

/**
 * @route GET card/:cid
 * @desc Gets the Card with the given ID
 * @access public
 */
export async function GetCard(req: ExpressRequest, res: ExpressResponse) {
    const id = req.params.cid;
    try {
        const card = await Card.findById(id).select("-__v");
        if (!card) {
            res.status(404).json({
                status: "error",
                message: "Card not found",
                data: null,
            });
            return;
        }

        const deck = await Deck.findById(card.deck);
        if (!deck)
            throw new Error("Deck not found");
        else if (!deck.isAccessibleBy(req.user._id).readable) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized Operation",
                data: null,
            });
            return;
        }

        res.status(200).json({
            status: "success",
            message: "Card found",
            data: card,
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
            data: null,
        });
    }
    res.end();
}

/**
 * @route DELETE card/:cid
 * @desc Deletes the Card with the given ID
 * @access public
 */
export async function DeleteCard(req: ExpressRequest, res: ExpressResponse) {
    const id = req.params.cid;
    try {
        const card = await Card.findById(id);
        if (!card) {
            res.status(404).json({
                status: "error",
                message: "Card not found",
            });
            return;
        }

        const deck = await Deck.findById(card.deck);
        if (!deck)
            throw new Error("Deck not found");
        else if (!deck.isAccessibleBy(req.user._id).writable) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized Operation",
            });
            return;
        }

        await card.deleteOne();
        res.status(200).json({
            status: "success",
            message: "Card deleted successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
    res.end();
}

/**
 * @route PATCH card/:cid
 * @desc Updates the Card with the given ID
 * @access public
 */
export async function UpdateCard(req: ExpressRequest, res: ExpressResponse) {
    const id = req.params.cid;
    try {
        const { question, answer, hint, deck } = req.body;

        if (!question && !answer && !hint && !deck) {
            res.status(400).json({
                status: "error",
                message: "No fields to update",
            });
            return;
        }

        const card = await Card.findById(id);
        if (!card) {
            res.status(404).json({
                status: "error",
                message: "Card not found",
            });
            return;
        }

        const currentDeck = await Deck.findById(card.deck);
        if (!currentDeck)
            throw new Error("Deck not found");
        else if (!currentDeck.isAccessibleBy(req.user._id).writable) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized Operation",
            });
            return;
        }
        currentDeck.dateUpdated = new Date();
        currentDeck.save();

        if (deck && deck.length > 0) {
            const nextDeck = await Deck.findById(deck);
            if (!nextDeck)
                throw new Error("Deck not found");
            else if (!nextDeck.isAccessibleBy(req.user._id).writable) {
                res.status(401).json({
                    status: "error",
                    message: "Unauthorized Operation",
                });
                return;
            }

            nextDeck.dateUpdated = new Date();
            nextDeck.save();
        }

        card.question = question || card.question;
        card.answer = answer || card.answer;
        card.hint = hint || card.hint;
        card.deck = deck || card.deck;
        card.save();

        res.status(200).json({
            status: "success",
            message: "Card updated successfully",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
    res.end();
}
