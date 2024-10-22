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
            });
            return;
        }

        res.status(200).json({
            status: "success",
            data: {
                "fullName": user.fullName,
            },
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
        });

        res.status(200).json({
            status: "success",
            data: likedDecks,
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
    res.end();
}
