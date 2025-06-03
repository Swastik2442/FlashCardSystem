import type {
    Request as ExpressRequest,
    Response as ExpressResponse
} from "express";
import User from "@/models/user.model";
import type { UserRole } from "@/models/user.model";
import Deck from "@/models/deck.model";
import {
    CSRF_COOKIE_NAME,
    UNCATEGORISED_DECK_NAME
} from "@/constants";
import { UserAccessibleRoles } from "@/lib/featureFlags";
import { getUserWith, getUsersWith } from "@/utils/models";
import { tryCatch } from "@/utils/wrappers";

/**
 * @route GET user/
 * @desc Gets the logged in User's Full Name, Username, Email
 * @access private
 */
export const GetUserPrivate = tryCatch(async (
    req: ExpressRequest, res: ExpressResponse
) => {
    res.status(200).json({
        status: "success",
        message: "User found",
        data: {
            "fullName": req.user!.fullName,
            "username": req.user!.username,
            "email": req.user!.email,
        },
    });
});

/**
 * @route GET user/get/:username
 * @desc Gets the User Full Name and Username with the given Username/ID
 * @access public
 */
export const GetUser = tryCatch(async (req, res) => {
    const username = req.params.username;
    if (!username) {
        res.status(422).json({
            status: "error",
            message: "username is required",
            data: null
        });
        return;
    }

    const user = await getUserWith(username);
    if (!user) {
        res.status(404).json({
            status: "error",
            message: "User not found",
            data: null
        });
        return;
    }

    res.status(200).json({
        status: "success",
        message: "User found",
        data: {
            fullName: user.fullName,
            username: user.username
        }
    });
});

/**
 * @route GET user/get
 * @desc Gets the Full Name and Username with the given Usernames/IDs
 * @access public
 */
export const GetUsers = tryCatch(async (req, res) => {
    const usernames = req.query.usernames;
    const users = await getUsersWith((typeof usernames === "string") ? [usernames] : usernames as string[]);
    if (!users) {
        res.status(404).json({
            status: "error",
            message: "User(s) not found",
            data: null
        });
        return;
    }

    res.status(200).json({
        status: "success",
        message: "User found",
        data: users.map(user => ({
            _id: user._id,
            fullName: user.fullName,
            username: user.username
        }))
    });
});

/**
 * @route GET user/substr/:str
 * @desc Gets the Users whose username is a substring of the given string
 * @access public
 */
export const GetUserSub = tryCatch(async (req, res) => {
    const str = req.params.str;
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
});

/**
 * @route GET user/decks/:username
 * @desc Gets the User's Decks visible to the current User
 * @access public
 */
export const GetUserDecks = tryCatch(async (
    req: ExpressRequest, res: ExpressResponse
) => {
    const username = req.params.username;
    if (!username) {
        res.status(422).json({
            status: "error",
            message: "username is required",
            data: null
        });
        return;
    }

    const user = await getUserWith(username);
    if (!user) {
        res.status(404).json({
            status: "error",
            message: "User not found",
            data: null
        });
        return;
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
});

/**
 * @route GET user/liked/decks/:username
 * @desc Gets the Decks liked by the User
 * @access public
 */
export const GetLikedDecks = tryCatch(async (
    req: ExpressRequest, res: ExpressResponse
) => {
    const username = req.params.username;
    if (!username) {
        res.status(422).json({
            status: "error",
            message: "username is required",
            data: null
        });
        return;
    }

    const user = await getUserWith(username);
    if (!user) {
        res.status(404).json({
            status: "error",
            message: "User not found",
            data: null
        });
        return;
    }

    const likedDecks = await Deck.find({
        likedBy: user._id,
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
});

/**
 * @route PATCH user/edit
 * @desc Edit the Details of the Logged In User
 * @access private
 */
export const UpdateUser = tryCatch(async (
    req: ExpressRequest, res: ExpressResponse
) => {
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

    res.status(200).clearCookie(CSRF_COOKIE_NAME).json({
        status: "success",
        message: "User updated successfully",
    });
});

/**
 * @route GET user/roles/all
 * @desc Get all Possible User Roles
 * @access private
 */
export const GetUserAccessibleRoles = tryCatch(async (_req, res) => {
    res.status(200).set(
        "Cache-Control",
        "private, max-age=43200"
    ).json({
        status: "success",
        message: "Possible User Roles",
        data: UserAccessibleRoles
    });
});

/**
 * @route GET user/roles
 * @desc Get current User Roles
 * @access private
 */
export const GetUserRoles = tryCatch(async (
    req: ExpressRequest, res: ExpressResponse
) => {
    if (!req.user)
        throw new Error("User not found");
    res.status(200).set(
        "Cache-Control",
        "private, max-age=60"
    ).json({
        status: "success",
        message: "Successfully get User Roles",
        data: req.user.roles
    });
});

/**
 * @route PATCH user/roles
 * @desc Set current User Roles
 * @access private
 */
export const SetUserRoles = tryCatch(async (
    req: ExpressRequest, res: ExpressResponse
) => {
    const { roles } = req.body;
    if (!req.user)
        throw new Error("User not found");

    // Add roles where value is true and not already present
    Object.entries(roles)
        .filter(([, value]) => value === true)
        .forEach(([key]) => {
            if (!req.user!.roles.includes(key as UserRole))
                req.user!.roles.push(key as UserRole);
        });

    // Remove roles where value is false and currently present
    Object.entries(roles)
        .filter(([, value]) => value === false)
        .forEach(([key]) => {
            req.user!.roles = req.user!.roles.filter((role: string) => role !== key);
        });

    await req.user.save();
    res.status(200).json({
        status: "success",
        message: "User Roles set",
    });
});
