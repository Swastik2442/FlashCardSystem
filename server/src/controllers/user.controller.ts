import { Request as ExpressRequest, Response as ExpressResponse } from "express";
import User from "../models/user.model";
import Deck from "../models/deck.model";

/**
 * @route GET user/get/:username
 * @desc Gets the User with the given Username
 * @access public
 */
export async function GetUser(req: ExpressRequest, res: ExpressResponse) {
    const username = req.params.username;
    try {
        const user = await User.findOne({ username: username.toLowerCase() }).select("-password -refreshToken");
        if (!user) {
            res.status(404).json({
                status: "error",
                message: "User not found",
                data: null,
            });
            return;
        }

        res.status(200).json({
            status: "success",
            message: "User found",
            data: {
                "fullName": user.fullName,
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
 * @route GET user/liked
 * @desc Gets the Decks liked by the User
 * @access public
 */
export async function GetLikedDecks(req: ExpressRequest, res: ExpressResponse) {
    try {
        const likedDecks = await Deck.find({
            likedBy: req.user._id,
            $or: [
                { isPrivate: false },
                { sharedTo: { $elemMatch: { user: req.user._id } } }
            ]
        }).select("-owner -description -dateCreated -dateUpdated -cards -isPrivate -sharedTo -likes -likedBy -__v");

        res.status(200).json({
            status: "success",
            message: `${likedDecks.length} Decks found`,
            data: likedDecks,
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
