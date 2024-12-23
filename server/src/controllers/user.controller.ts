import { Request as ExpressRequest, Response as ExpressResponse } from "express";
import User from "../models/user.model";
import Deck from "../models/deck.model";
import { CSRF_COOKIE_NAME, UNCATEGORISED_DECK_NAME } from "../constants";

const checkForHexRegExp = new RegExp('^[0-9a-fA-F]{24}$');

/**
 * @route GET user/
 * @desc Gets the logged in User's Private Details
 * @access private
 */
export async function GetUserPrivate(req: ExpressRequest, res: ExpressResponse) {
    try {
        res.status(200).json({
            status: "success",
            message: "User found",
            data: {
                "fullName": req.user!.fullName,
                "username": req.user!.username,
                "email": req.user!.email,
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
 * @route GET user/substr/:str
 * @desc Gets the Users whose username is a substring of the given string
 * @access public
 */
export async function GetUserSub(req: ExpressRequest, res: ExpressResponse) {
    const str = req.params.str;
    try {
        const users = await User.find({
            username: { $regex: str, $options: "i" }
        }).limit(5).select("-email -password -refreshToken -__v");
        if (!users || users.length === 0) {
            res.status(200).json({
                status: "success",
                message: "No Users found",
                data: [],
            });
            return;
        }

        res.status(200).json({
            status: "success",
            message: "Users found",
            data: users,
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
 * @route GET user/decks/:username
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
                { owner: req.user!._id, name: { $ne: UNCATEGORISED_DECK_NAME } },
                { sharedTo: { $elemMatch: { user: req.user!._id, editable: true } } },
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
 * @route GET user/liked
 * @desc Gets the Decks liked by the User
 * @access public
 */
export async function GetLikedDecks(req: ExpressRequest, res: ExpressResponse) {
    try {
        const likedDecks = await Deck.find({
            likedBy: req.user!._id,
            $or: [
                { isPrivate: false },
                { sharedTo: { $elemMatch: { user: req.user!._id } } }
            ]
        }).select("-owner -description -dateCreated -sharedTo -likedBy -__v");

        res.status(200).json({
            status: "success",
            message: `${likedDecks.length} Decks found`,
            data: likedDecks,
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
 * @route PATCH user/edit
 * @desc Edit the Details of the Logged In User
 * @access private
 */
export async function UpdateUser(req: ExpressRequest, res: ExpressResponse) {
    try {
        const { fullName } = req.body;
        if (!fullName) {
            res.status(422).json({
                status: "error",
                message: "No fields to update",
            });
            return;
        }

        req.user!.fullName = fullName ?? req.user!.fullName;
        await req.user!.save();

        res.status(200)
        .clearCookie(CSRF_COOKIE_NAME)
        .json({
            status: "success",
            message: "User updated successfully",
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
