import { Request as ExpressRequest, Response as ExpressResponse } from "express";
import User from "../models/user.model";
import Deck from "../models/deck.model";

const checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');

/**
 * @route GET user/get/:username
 * @desc Gets the User with the given Username/ID
 * @access public
 */
export async function GetUser(req: ExpressRequest, res: ExpressResponse) {
    const username = req.params.username;
    try {
        let user;
        if (username.length === 24 && checkForHexRegExp.test(username))
            user = await User.findById(username).select("-password -refreshToken");
        if (!user) {
            user = await User.findOne({ username: username.toLowerCase() }).select("-password -refreshToken");
            if (!user) {
                res.status(404).json({
                    status: "error",
                    message: "User not found",
                    data: null,
                });
                return;
            }
        }

        res.status(200).json({
            status: "success",
            message: "User found",
            data: {
                "fullName": user.fullName,
                "username": user.username,
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
 * @route GET user/getsub/:str
 * @desc Gets the Users whose username is a substring of the given string
 * @access public
 */
export async function GetUserSub(req: ExpressRequest, res: ExpressResponse) {
    const str = req.params.str;
    try {
        let users = await User.find({ username: {$regex: str, $options: "i"}}).limit(5).select("-password -refreshToken");
        if (!users || users.length === 0) {
            res.status(200).json({
                status: "error",
                message: "No Users found",
                data: [],
            });
            return;
        }

        res.status(200).json({
            status: "success",
            message: "Users found",
            data: users.map(user => ({
                "id": user._id,
                "fullName": user.fullName,
                "username": user.username,
            })),
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
 * @route GET user/decks/:str
 * @desc Gets the User's Decks visible to the current User
 * @access public
 */
export async function GetUserDecks(req: ExpressRequest, res: ExpressResponse) {
    const username = req.params.username;
    try {
        let user;
        if (username.length === 24 && checkForHexRegExp.test(username))
            user = await User.findById(username).select("-password -refreshToken");
        if (!user) {
            user = await User.findOne({ username: username.toLowerCase() }).select("-password -refreshToken");
            if (!user) {
                res.status(404).json({
                    status: "error",
                    message: "User not found",
                    data: null,
                });
                return;
            }
        }

        const decks = await Deck.find({
            owner: user._id,
            $or: [
                { isPrivate: false },
                { sharedTo: { $elemMatch: { user: req.user._id } } }
            ]
        }).select("-owner -description -dateCreated -cards -sharedTo -likedBy -__v");

        res.status(200).json({
            status: "success",
            message: "Users found",
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
        }).select("-owner -description -dateCreated -cards -sharedTo -likedBy -__v");

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
