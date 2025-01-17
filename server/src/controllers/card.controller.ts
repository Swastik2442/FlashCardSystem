import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Request as ExpressRequest, Response as ExpressResponse } from "express";
import Deck from "../models/deck.model";
import Card from "../models/card.model";
import env from "../env";
import { GEMINI_MODEL_NAME, CSRF_COOKIE_NAME, UNCATEGORISED_DECK_NAME } from "../constants";

const cardSchema = {
    description: "Question, Answer, and Hint for a Learning Card (Results only in Characters typeable on a Keyboard)",
    type: SchemaType.OBJECT,
    properties: {
        question: {
            type: SchemaType.STRING,
            description: "Question of the Card in less than 128 characters",
            nullable: false,
        },
        answer: {
            type: SchemaType.STRING,
            description: "Answer of the Card in less than 128 characters",
            nullable: false,
        },
        hint: {
            type: SchemaType.STRING,
            description: "Hint for the Answer of the Card in less than 64 characters",
            nullable: true,
        }
    },
    required: ["question", "answer"],
};

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const cardModel = genAI.getGenerativeModel({
    model: GEMINI_MODEL_NAME,
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: cardSchema,
    },
});

/**
 * @route POST card/new
 * @desc Creates a new Card
 * @access private
 */
export async function CreateCard(req: ExpressRequest, res: ExpressResponse) {
    const { question, answer, hint, deck } = req.body;
    try {
        let deckById;
        if (!deck) {
            deckById = await Deck.findOne({
                owner: req.user!._id, name: UNCATEGORISED_DECK_NAME
            }).select("-name -description -dateCreated -dateUpdated -likedBy -__v");
            if (!deckById) {
                deckById = await Deck.create({
                    owner: req.user!._id,
                    name: UNCATEGORISED_DECK_NAME,
                    isPrivate: true
                });
                await deckById.save();
            }
        } else {
            deckById = await Deck.findById(deck).select("-name -description -dateCreated -dateUpdated -likedBy -__v");;
            if (!deckById) {
                res.status(404).json({
                    status: "error",
                    message: "Deck not found",
                    data: null,
                });
                return;
            } else if (!deckById.isAccessibleBy(req.user!._id).writable) {
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
        await deckById.save();

        res.status(201)
        .clearCookie(CSRF_COOKIE_NAME)
        .json({
            status: "success",
            message: "Card created successfully",
            data: newCard._id,
        });
    } catch (err) {
        console.error(err);
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
 * @access private
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

        const deck = await Deck.findById(card.deck).select("-name -description -dateCreated -dateUpdated -likedBy -__v");
        if (!deck) {
            res.status(404).json({
                status: "error",
                message: "Deck not found",
                data: null,
            });
            return;
        } else if (!deck.isAccessibleBy(req.user!._id).readable) {
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
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
            data: null,
        });
    }
    res.end();
}

/**
 * @route GET card/populate/:cid
 * @desc Populates the Card with the given ID with AI-generated content
 * @access private
 */
export async function PopulateCard(req: ExpressRequest, res: ExpressResponse) {
    const id = req.params.cid;
    try {
        const card = await Card.findById(id).select("-__v -question -answer -hint");
        if (!card) {
            res.status(404).json({
                status: "error",
                message: "Card not found",
                data: null,
            });
            return;
        }

        const deck = await Deck.findById(card.deck).select("-owner -dateCreated -dateUpdated -isPrivate -sharedTo -likes -likedBy -__v");
        if (!deck) {
            res.status(404).json({
                status: "error",
                message: "Deck not found",
                data: null,
            });
            return;
        }

        let question = "Generate the Question, Answer and Hint for a single Learning Card";
        if (deck.name != UNCATEGORISED_DECK_NAME)
            question += ` where the collection's name is "${deck.name}" and the collection's description is "${deck.description}"`;
        const result = await cardModel.generateContent(question);

        res.status(200).json({
            status: "success",
            message: "Card Content Generated",
            data: result.response.text(),
        });
    } catch (err) {
        console.error(err);
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
 * @access private
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

        const deck = await Deck.findById(card.deck).select("-name -description -dateCreated -dateUpdated -likedBy -__v");
        if (!deck) {
            res.status(404).json({
                status: "error",
                message: "Deck not found",
            });
            return;
        }
        else if (!deck.isAccessibleBy(req.user!._id).writable) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized Operation",
            });
            return;
        }
        deck.dateUpdated = new Date();
        await deck.save();

        await card.deleteOne();
        res.status(200)
        .clearCookie(CSRF_COOKIE_NAME)
        .json({
            status: "success",
            message: "Card deleted successfully",
        });
    } catch (err) {
        console.error(err);
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
 * @access private
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

        const currentDeck = await Deck.findById(card.deck).select("-name -description -dateCreated -dateUpdated -likedBy -__v");
        if (!currentDeck)
            throw new Error("Deck not found");
        else if (!currentDeck.isAccessibleBy(req.user!._id).writable) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized Operation",
            });
            return;
        }
        currentDeck.dateUpdated = new Date();
        await currentDeck.save();

        if (deck && deck.length > 0) {
            const nextDeck = await Deck.findById(deck).select("-name -description -dateCreated -dateUpdated -likedBy -__v");
            if (!nextDeck) {
                res.status(404).json({
                    status: "error",
                    message: "Deck not found",
                });
                return;
            } else if (!nextDeck.isAccessibleBy(req.user!._id).writable) {
                res.status(401).json({
                    status: "error",
                    message: "Unauthorized Operation",
                });
                return;
            }
            nextDeck.dateUpdated = new Date();
            await nextDeck.save();
        }

        card.question = question ?? card.question;
        card.answer = answer ?? card.answer;
        card.hint = hint ?? card.hint;
        card.deck = deck ?? card.deck;
        await card.save();

        res.status(200)
        .clearCookie(CSRF_COOKIE_NAME)
        .json({
            status: "success",
            message: "Card updated successfully",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
    res.end();
}
