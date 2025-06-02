import {
    GoogleGenerativeAI,
    Schema,
    SchemaType
} from "@google/generative-ai";
import {
    Request as ExpressRequest,
    Response as ExpressResponse
} from "express";
import Deck from "@/models/deck.model";
import Card from "@/models/card.model";
import type { ICard } from "@/models/card.model";
import env from "@/env";
import {
    GEMINI_MODEL_NAME,
    CSRF_COOKIE_NAME,
    UNCATEGORISED_DECK_NAME
} from "@/constants";
import { getUserWith, getUsersWith } from "@/utils/models";
import { tryCatch } from "@/utils/wrappers";

type CardSchema = Omit<ICard, "deck">;

const aiCardsSchema = {
    description: "Question, Answer, and Hint for a Set of Learning Cards (Results only in Characters typeable on a Keyboard with few or no Punctuation Marks)",
    type: SchemaType.ARRAY,
    items: {
        type: SchemaType.OBJECT,
        properties: {
            question: {
                type: SchemaType.STRING,
                description: "Question of the Card in less than 64 characters",
                nullable: false,
            },
            answer: {
                type: SchemaType.STRING,
                description: "Answer of the Card in less than 64 characters",
                nullable: false,
            },
            hint: {
                type: SchemaType.STRING,
                description: "Hint for the Answer of the Card in less than 32 characters",
                nullable: true,
            }
        },
    }
} as Schema;

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const aiCardsModel = genAI.getGenerativeModel({
    model: GEMINI_MODEL_NAME,
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: aiCardsSchema,
    },
});

/**
 * @route POST deck/new
 * @desc Creates a new Deck
 * @access private
 */
export const CreateDeck = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
    const { name, description, isPrivate } = req.body;
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
});

/**
 * @route GET deck/:did
 * @desc Gets the Deck with the given ID
 * @access private
 */
export const GetDeck = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
    const id = req.params.did;
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
});

/**
 * @route GET deck/cards/:did
 * @desc Gets all the Cards in the Deck with the given ID
 * @access private
 */
export const GetDeckCards = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
    const id = req.params.did;
    const deck = await Deck.findById(id).select("-deck -description -dateCreated -dateUpdated -likedBy -__v");
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
});

/**
 * @route GET deck/all
 * @desc Gets all the Decks owned by or shared to the User
 * @access private
 */
export const GetAllDecks = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
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
});

/**
 * @route DELETE deck/:did
 * @desc Deletes the Deck with the given ID
 * @access private
 */
export const DeleteDeck = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
    const id = req.params.did;
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
});

/**
 * @route PATCH deck/:did
 * @desc Updates the Deck with the given ID
 * @access private
 */
export const UpdateDeck = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
    const id = req.params.did;
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
});

/**
 * @route GET deck/populate/:did
 * @desc Populates the Deck with the given ID with AI-generated Learning Cards
 * @access private
 */
export const PopulateDeck = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
    const id = req.params.did;
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

    const result = await aiCardsModel.generateContent(
        `Generate the Content for 5 Learning Cards where the collection's name is "${deck.name}" and the collection's description is "${deck.description}"`
    );
    const newCards: CardSchema[] = JSON.parse(result.response.text());
    await Card.create(newCards.map(card => ({ ...card, deck: deck._id })));

    res.status(200).json({
        status: "success",
        message: "Deck Content Generated",
    });
});

/**
 * @route PATCH deck/owner/:did
 * @desc Changes the Owner of the Deck with the given ID
 * @access private
 */
export const ChangeDeckOwner = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
    const id = req.params.did;
    const { user } = req.body;

    const userByID = await getUserWith(user);
    if (!userByID || String(userByID._id) == String(req.user!._id)) {
        res.status(422).json({
            status: "error",
            message: "Invalid User ID",
        });
        return;
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
});

/**
 * @route GET deck/share/:did
 * @desc Gets the User IDs of the Users with whom the Deck is Shared
 * @access private
 */
export const GetSharedWithUsers = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
    const id = req.params.did;

    const deck = await Deck.findOne({
        _id: id,
        owner: req.user!._id,
        name: { $ne: UNCATEGORISED_DECK_NAME }
    }).select("-owner -name -description -dateCreated -dateUpdated -isPrivate -likes -likedBy");
    if (!deck) {
        res.status(404).json({
            status: "error",
            message: "Deck not found",
            data: null
        });
        return;
    }

    res.status(200).json({
        status: "success",
        message: "Successfully get Shared with Users",
        data: deck.sharedTo.map(v => ({ user: v.user, isEditable: v.editable }))
    });
});

/**
 * @route POST deck/share/:did or POST deck/unshare/:did
 * @desc Shares/Unshares the Deck with the given User IDs
 * @access private
 */
export const ShareDeck = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
    const id = req.params.did;
    const { users, isEditable, unshare } = req.body;

    // Find the Deck
    const deck = await Deck.findOne({
        _id: id,
        owner: req.user!._id,
        name: { $ne: UNCATEGORISED_DECK_NAME }
    });
    if (!deck) {
        res.status(404).json({ status: "error", message: "Deck not found" });
        return;
    }

    // Find the Users
    let usersByID = await getUsersWith(users);
    if (!usersByID || usersByID.length != users.length) {
        res.status(422).json({ status: "error", message: "Invalid User ID" });
        return;
    }
    usersByID = usersByID.map(u => u.id);

    // Share/Unshare the Deck
    await Deck.updateOne(     // Unshare
        { _id: deck._id },
        { $pull: { sharedTo: { user: { $in: usersByID } } } }
    );
    if (!unshare || unshare == undefined || isEditable != undefined)
        await Deck.updateOne( // Share
            { _id: deck._id },
            { $push: { sharedTo: {
                $each: usersByID.map(id => ({ user: id, editable: isEditable }))
            } } }
        );

    res.status(200).clearCookie(CSRF_COOKIE_NAME).json({
        status: "success", message: "Deck sharing updated"
    });
});

/**
 * @route GET deck/likes/:did
 * @desc Get the User IDs that liked the Deck with the given ID
 * @access private
 */
export const GetDeckLikes = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
    const id = req.params.did;
    const deck = await Deck.findById(id).select("-description -likes -__v -dateUpdated -dateCreated");
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
        message: "Successfully get Deck Likes",
        data: deck.likedBy,
    });
});

/**
 * @route GET deck/likes/add/:did
 * @desc Likes the Deck with the given ID
 * @access private
 */
export const LikeDeck = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
    const id = req.params.did;
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
});

/**
 * @route GET deck/likes/remove/:did
 * @desc Unlikes the Deck with the given ID
 * @access private
 */
export const UnlikeDeck = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
    const id = req.params.did;
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
});
