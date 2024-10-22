import { Request as ExpressRequest, Response as ExpressResponse } from "express";
import mongoose from "mongoose";
import User from "../models/user.model";
import Deck from "../models/deck.model";

/**
 * @route POST deck/new
 * @desc Creates a new Deck
 * @access public
 */
export async function CreateDeck(req: ExpressRequest, res: ExpressResponse) {
    const { name, description, isPrivate } = req.body;
    try {
        if (name == "#UNCATEGORISED#") {
            res.status(422).json({
                status: "error",
                message: "Invalid Deck Name",
                data: null,
            });
            return;
        }

        const newDeck = await Deck.create({
            owner: req.user._id,
            name: name,
            description: description,
            isPrivate: isPrivate
        });

        const deckCheck = await Deck.findById(newDeck._id);
        if (!deckCheck)
            throw new Error("Deck could not be created");

        res.status(200).json({
            status: "success",
            message: "Deck created successfully",
            data: newDeck._id,
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
 * @route GET deck/:did
 * @desc Gets the Deck with the given ID
 * @access public
 */
export async function GetDeck(req: ExpressRequest, res: ExpressResponse) {
    const id = req.params.did;
    try {
        const deck = await Deck.findById(id).select("-likedBy");
        if (!deck) {
            res.status(404).json({
                status: "error",
                message: "Deck not found",
                data: null,
            });
            return;
        } else if (!deck.isAccessibleBy(req.user._id)) {
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
                cards: deck.cards,
                isPrivate: deck.isPrivate,
                isEditable: deck.isAccessibleBy(req.user._id).writable,
                likes: deck.likes,
            },
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
 * @route GET deck/all
 * @desc Gets all the Decks owned by or shared to the User
 * @access public
 */
export async function GetAllDecks(req: ExpressRequest, res: ExpressResponse) {
    try {
        const decks = await Deck.find({
            $or: [
                { owner: req.user._id },
                { sharedTo: { $elemMatch: { user: req.user._id } } },
            ]
        }).select("-owner -description -dateCreated -cards -sharedTo -likedBy -__v");

        res.status(200).json({
            status: "success",
            message: `${decks.length} Decks found`,
            data: decks,
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
 * @route DELETE deck/:did
 * @desc Deletes the Deck with the given ID
 * @access public
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
        } else if (deck.owner != req.user._id || deck.name == "#UNCATEGORISED#") {
            res.status(401).json({
                status: "error",
                message: "Unauthorized Operation",
            });
            return;
        }

        await deck.deleteOne();
        res.status(200).json({
            status: "success",
            message: "Deleted the Deck",
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
 * @route PATCH deck/:did
 * @desc Updates the Deck with the given ID
 * @access public
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

        if (name && name == "#UNCATEGORISED#") {
            res.status(422).json({
                status: "error",
                message: "Invalid Deck Name",
            });
            return;
        }

        const deck = await Deck.findById(id);
        if (!deck) {
            res.status(404).json({
                status: "error",
                message: "Deck not found",
            });
            return;
        } else if (!deck.isAccessibleBy(req.user._id).writable) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized Operation",
            });
            return;
        }

        deck.name = name || deck.name;
        deck.description = description || deck.description;
        deck.isPrivate = isPrivate || deck.isPrivate;

        res.status(200).json({
            status: "success",
            message: "Deck updated successfully",
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
 * @route POST deck/share/:did
 * @desc Shares the Deck with the given ID with the given User IDs
 * @access public
 */
export async function ShareDeck(req: ExpressRequest, res: ExpressResponse) {
    const id = req.params.did;
    try {
        const { username, isEditable } = req.body;

        const userByUsername = await User.findOne({ username: username });
        if (!userByUsername || userByUsername.username == req.user.username) {
            res.status(422).json({
                status: "error",
                message: "Invalid Username",
            });
            return;
        }

        const deck = await Deck.findById(id);
        if (!deck) {
            res.status(404).json({
                status: "error",
                message: "Deck not found",
            });
            return;
        } else if (deck.owner != req.user._id) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized Operation",
            });
            return;
        }

        // if (deck.sharedTo.some(({user, editable}) => user == userByUsername._id)) { // ERROR: Cannot compare the two types
        //     res.status(200).json({
        //         status: "success",
        //         message: "Already shared",
        //     });
        //     return;
        // }

        deck.sharedTo.push({ user: username, editable: isEditable });
        await deck.save();

        res.status(200).json({
            status: "success",
            message: "Deck shared successfully",
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
 * @route GET deck/likes/:did
 * @desc Get the User IDs that liked the Deck with the given ID
 * @access public
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
        } else if (!deck.isAccessibleBy(req.user._id)) {
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
 * @access public
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

        if (deck.likedBy.includes(req.user._id)) {
            res.status(200).json({
                status: "success",
                message: "Already liked",
            });
            return;
        }

        deck.likedBy.push(req.user._id);
        deck.likes++;
        await deck.save();

        res.status(200).json({
            status: "success",
            data: "Liked the Deck",
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
 * @route GET deck/likes/remove/:did
 * @desc Unlikes the Deck with the given ID
 * @access public
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

        if (!deck.likedBy.includes(req.user._id)) {
            res.status(200).json({
                status: "success",
                message: "Unliked the Deck",
            });
            return;
        }

        deck.likedBy.splice(deck.likedBy.indexOf(req.user._id), 1);
        deck.likes--;
        await deck.save();

        res.status(200).json({
            status: "success",
            message: "Unliked the Deck",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
    res.end();
}
