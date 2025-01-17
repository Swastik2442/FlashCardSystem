import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Request as ExpressRequest, Response as ExpressResponse } from "express";
import User from "../models/user.model";
import Deck from "../models/deck.model";
import Card from "../models/card.model";
import env from "../env";
import { GEMINI_MODEL_NAME, CSRF_COOKIE_NAME, UNCATEGORISED_DECK_NAME } from "../constants";

interface CardSchema {
    question: string;
    answer: string;
    hint?: string;
}

const cardsSchema = {
    description: "Question, Answer, and Hint for a Set of Learning Cards (Results only in Characters typeable on a Keyboard)",
    type: SchemaType.ARRAY,
    items: {
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
    }
};

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const cardsModel = genAI.getGenerativeModel({
    model: GEMINI_MODEL_NAME,
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: cardsSchema,
    },
});

/**
 * @route POST deck/new
 * @desc Creates a new Deck
 * @access private
 */
export async function CreateDeck(req: ExpressRequest, res: ExpressResponse) {
    const { name, description, isPrivate } = req.body;
    try {
        if (name == UNCATEGORISED_DECK_NAME) {
            res.status(422).json({
                status: "error",
                message: "Invalid Deck Name",
                data: null,
            });
            return;
        }

        const newDeck = await Deck.create({
            owner: req.user!._id,
            name: name,
            description: description,
            isPrivate: isPrivate
        });

        const deckCheck = await Deck.findById(newDeck._id);
        if (!deckCheck)
            throw new Error("Deck could not be created");

        res.status(201)
        .clearCookie(CSRF_COOKIE_NAME)
        .json({
            status: "success",
            message: "Deck created successfully",
            data: newDeck._id,
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
 * @route GET deck/:did
 * @desc Gets the Deck with the given ID
 * @access private
 */
export async function GetDeck(req: ExpressRequest, res: ExpressResponse) {
    const id = req.params.did;
    try {
        const deck = await Deck.findById(id);
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
                message: "Deck is Private",
                data: null,
            });
            return;
        }

        res.status(200).json({
            status: "success",
            message: "Deck found",
            data: {
                owner: deck.owner,
                name: deck.name,
                description: deck.description,
                dateCreated: deck.dateCreated,
                dateUpdated: deck.dateUpdated,
                isPrivate: deck.isPrivate,
                isEditable: deck.isAccessibleBy(req.user!._id).writable,
                likes: deck.likes,
                isLiked: deck.likedBy.includes(req.user!.id),
            },
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
 * @route GET deck/cards/:did
 * @desc Gets all the Cards in the Deck with the given ID
 * @access private
 */
export async function GetDeckCards(req: ExpressRequest, res: ExpressResponse) {
    const id = req.params.did;
    try {
        const deck = await Deck.findById(id).select("-description -dateCreated -dateUpdated -likedBy -__v");
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
                message: "Deck is Private",
                data: null,
            });
            return;
        }

        const cards = await Card.find({ deck: deck._id }).select("-__v");
        res.status(200).json({
            status: "success",
            message: `${cards.length} Cards found`,
            data: cards,
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
 * @route GET deck/all
 * @desc Gets all the Decks owned by or shared to the User
 * @access private
 */
export async function GetAllDecks(req: ExpressRequest, res: ExpressResponse) {
    try {
        const decks = await Deck.find({
            $or: [
                { owner: req.user!._id },
                { sharedTo: { $elemMatch: { user: req.user!._id } } },
            ]
        }).select("-owner -description -dateCreated -sharedTo -likedBy -__v");

        res.status(200).json({
            status: "success",
            message: `${decks.length} Decks found`,
            data: decks,
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
 * @route DELETE deck/:did
 * @desc Deletes the Deck with the given ID
 * @access private
 */
export async function DeleteDeck(req: ExpressRequest, res: ExpressResponse) {
    const id = req.params.did;
    try {
        const deck = await Deck.findById(id);
        if (!deck) {
            res.status(404).json({
                status: "error",
                message: "Deck not found",
            });
            return;
        } else if (String(deck.owner) != String(req.user!._id) || deck.name == UNCATEGORISED_DECK_NAME) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized Operation",
            });
            return;
        }

        await deck.deleteOne();
        res.status(200)
        .clearCookie(CSRF_COOKIE_NAME)
        .json({
            status: "success",
            message: "Deleted the Deck",
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
 * @route PATCH deck/:did
 * @desc Updates the Deck with the given ID
 * @access private
 */
export async function UpdateDeck(req: ExpressRequest, res: ExpressResponse) {
    const id = req.params.did;
    try {
        const { name, description, isPrivate } = req.body;

        if (!name && !description && !isPrivate) {
            res.status(422).json({
                status: "error",
                message: "No fields to update",
            });
            return;
        }

        if (name && name == UNCATEGORISED_DECK_NAME) {
            res.status(422).json({
                status: "error",
                message: "Invalid Deck Name",
            });
            return;
        }

        const deck = await Deck.findById(id).select("-dateUpdated -likes -likedBy -__v");
        if (!deck) {
            res.status(404).json({
                status: "error",
                message: "Deck not found",
            });
            return;
        } else if (!deck.isAccessibleBy(req.user!._id).writable) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized Operation",
            });
            return;
        }

        deck.name = name ?? deck.name;
        deck.description = description ?? deck.description;
        deck.isPrivate = typeof isPrivate == "boolean" ? isPrivate : deck.isPrivate;
        await deck.save();

        res.status(200)
        .clearCookie(CSRF_COOKIE_NAME)
        .json({
            status: "success",
            message: "Deck updated successfully",
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
 * @route GET deck/populate/:did
 * @desc Populates the Deck with the given ID with AI-generated Learning Cards
 * @access private
 */
export async function PopulateDeck(req: ExpressRequest, res: ExpressResponse) {
    const id = req.params.did;
        try {
            const deck = await Deck.findById(id).select("-dateCreated -likes -likedBy -__v");
            if (!deck || deck.name == UNCATEGORISED_DECK_NAME) {
                res.status(404).json({
                    status: "error",
                    message: "Deck not found",
                });
                return;
            } else if (!deck.isAccessibleBy(req.user!._id).writable) {
                res.status(401).json({
                    status: "error",
                    message: "Unauthorized Operation",
                });
                return;
            }

            const result = await cardsModel.generateContent(
                `Generate the Content for 5 Learning Cards where the collection's name is "${deck.name}" and the collection's description is "${deck.description}"`
            );
            const newCards: CardSchema[] = JSON.parse(result.response.text());
            await Card.create(newCards.map(card => ({ ...card, deck: deck._id })));

            res.status(200).json({
                status: "success",
                message: "Deck Content Generated",
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

const checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');

/**
 * @route PATCH deck/owner/:did
 * @desc Changes the Owner of the Deck with the given ID
 * @access private
 */
export async function ChangeDeckOwner(req: ExpressRequest, res: ExpressResponse) {
    const id = req.params.did;
    try {
        const { user } = req.body;

        let userByID;
        if (user.length === 24 && checkForHexRegExp.test(user))
            userByID = await User.findById(user).select("-password -refreshToken");
        if (!userByID) {
            userByID = await User.findOne({ username: user.toLowerCase() }).select("-password -refreshToken");
            if (!userByID || String(userByID._id) == String(req.user!._id)) {
                res.status(422).json({
                    status: "error",
                    message: "Invalid User ID",
                });
                return;
            }
        }

        const deck = await Deck.findOne({
            _id: id,
            owner: req.user!._id,
            name: { $ne: UNCATEGORISED_DECK_NAME },
        });
        if (!deck) {
            res.status(404).json({
                status: "error",
                message: "Deck not found",
            });
            return;
        }

        await Deck.updateOne(
            { _id: deck._id },
            {
                owner: userByID._id,
                $pull: { sharedTo: { user: userByID._id } }
            }
        );

        res.status(200)
        .clearCookie(CSRF_COOKIE_NAME)
        .json({
            status: "success",
            message: "Deck Owner updated",
        });
    } catch (err: unknown) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
}

/**
 * @route POST deck/share/:did or POST deck/unshare/:did
 * @desc Shares/Unshares the Deck with the given ID with the given User ID
 * @access private
 */
export async function ShareDeck(req: ExpressRequest, res: ExpressResponse) {
    const id = req.params.did;
    try {
        const { user, isEditable, unshare } = req.body;

        let userByID;
        if (user.length === 24 && checkForHexRegExp.test(user))
            userByID = await User.findById(user).select("-password -refreshToken");
        if (!userByID) {
            userByID = await User.findOne({ username: user.toLowerCase() }).select("-password -refreshToken");
            if (!userByID || String(userByID._id) == String(req.user!._id)) {
                res.status(422).json({
                    status: "error",
                    message: "Invalid User ID",
                });
                return;
            }
        }

        const deck = await Deck.findOne({
            _id: id,
            owner: req.user!._id,
            name: { $ne: UNCATEGORISED_DECK_NAME },
        });
        if (!deck) {
            res.status(404).json({
                status: "error",
                message: "Deck not found",
            });
            return;
        }

        await Deck.updateOne(
            { _id: deck._id },
            { $pull: { sharedTo: { user: userByID._id } } }
        );
        if (!unshare || unshare == undefined || isEditable != undefined)
            await Deck.updateOne(
                { _id: deck._id },
                { $push: { sharedTo: { user: userByID._id, editable: isEditable } } }
            );

        res.status(200)
        .clearCookie(CSRF_COOKIE_NAME)
        .json({
            status: "success",
            message: "Deck sharing updated",
        });
    } catch (err: unknown) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
    res.end();
}

/**
 * @route GET deck/likes/:did
 * @desc Get the User IDs that liked the Deck with the given ID
 * @access private
 */
export async function GetDeckLikes(req: ExpressRequest, res: ExpressResponse) {
    const id = req.params.did;
    try {
        const deck = await Deck.findById(id);
        if (!deck) {
            res.status(404).json({
                status: "error",
                message: "Deck not found",
            });
            return;
        } else if (!deck.isAccessibleBy(req.user!._id).readable) {
            res.status(401).json({
                status: "error",
                message: "Deck is Private",
            });
            return;
        }

        res.status(200).json({
            status: "success",
            data: deck.likedBy,
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
 * @route GET deck/likes/add/:did
 * @desc Likes the Deck with the given ID
 * @access private
 */
export async function LikeDeck(req: ExpressRequest, res: ExpressResponse) {
    const id = req.params.did;
    try {
        const deck = await Deck.findById(id);
        if (!deck) {
            res.status(404).json({
                status: "error",
                message: "Deck not found",
            });
            return;
        }

        if (deck.likedBy.includes(req.user!.id)) {
            res.status(200).json({
                status: "success",
                message: "Already liked",
            });
            return;
        }

        deck.likedBy.push(req.user!.id);
        deck.likes++;
        await deck.save();

        res.status(200).json({
            status: "success",
            message: "Liked the Deck",
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
 * @route GET deck/likes/remove/:did
 * @desc Unlikes the Deck with the given ID
 * @access private
 */
export async function UnlikeDeck(req: ExpressRequest, res: ExpressResponse) {
    const id = req.params.did;
    try {
        const deck = await Deck.findById(id);
        if (!deck) {
            res.status(404).json({
                status: "error",
                message: "Deck not found",
            });
            return;
        }

        if (!deck.likedBy.includes(req.user!.id)) {
            res.status(200).json({
                status: "success",
                message: "Unliked the Deck",
            });
            return;
        }

        deck.likedBy.splice(deck.likedBy.indexOf(req.user!.id), 1);
        deck.likes--;
        await deck.save();

        res.status(200).json({
            status: "success",
            message: "Unliked the Deck",
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
