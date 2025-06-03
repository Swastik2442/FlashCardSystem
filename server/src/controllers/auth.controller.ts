import type {
    Request as ExpressRequest,
    Response as ExpressResponse
} from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import ms, { type StringValue } from "ms";

import User from "@/models/user.model.js";
import env from "@/env.js";
import {
    ACCESS_TOKEN_COOKIE_NAME,
    REFRESH_TOKEN_COOKIE_NAME,
    CSRF_COOKIE_NAME
} from "@/constants.js";
import { tryCatch } from "@/utils/wrappers.js";

const cookieOptions = {
    httpOnly: true,
    signed: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
} as const;

async function generateAccessAndRefreshTokens(userId: mongoose.Types.ObjectId) {
    try {
        const user = await User.findById(userId).select("-password -refreshToken");
        if (!user)
            throw new Error("User not found");

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }); // Saves without triggering Pre Hooks

        return {accessToken, refreshToken};
    } catch (err: unknown) {
        throw new Error(`An Error occurred while generating Refresh and Access Tokens: ${err instanceof Error ? err.message : err}`);
    }
}

/**
 * @route POST auth/register
 * @desc Registers a User
 * @access public
 */
export const Register = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
    const { fullName, email, username, password } = req.body;
    const existingUser = await User.findOne({
        $or: [{ username: username.toLowerCase() }, { email: email }]
    }).select("-password -refreshToken");
    if (existingUser) {
        res.status(400).json({
            status: "error",
            message: "Account already exists",
        });
        return;
    }

    const newUser = await User.create({
        fullName: fullName,
        email: email,
        username: username.toLowerCase(),
        password: password,
    });

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken");
    if (!createdUser)
        throw new Error("User could not be created");

    res.status(200)
    .clearCookie(CSRF_COOKIE_NAME)
    .json({
        status: "success",
        message: "Registration Successful",
    });
});

/**
 * @route POST auth/login
 * @desc logs in a User
 * @access public
 */
export const Login = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
    const { email, username, password } = req.body;
    if (!username && !email) {
        res.status(400).json({
            status: "error",
            message: "Either email or username is required",
            data: null,
        });
        return;
    }

    const user = await User.findOne({
        $or: [
            { username: username === undefined ? null : username.toLowerCase() },
            { email: email === undefined ? null : email }
        ]
    }).select("-refreshToken");
    if (!user) {
        res.status(400).json({
            status: "error",
            message: "Account does not exist",
            data: null,
        });
        return;
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        res.status(401).json({
            status: "error",
            message: "Incorrect Password",
            data: null,
        });
        return;
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    res.status(200)
    .cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {...cookieOptions, maxAge: ms(env.ACCESS_TOKEN_EXPIRY as StringValue) })
    .cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {...cookieOptions, maxAge: ms(env.REFRESH_TOKEN_EXPIRY as StringValue) })
    .clearCookie(CSRF_COOKIE_NAME)
    .json({
        status: "success",
        message: "Login Successful",
        data: user.username,
    });
});

/**
 * @route GET /auth/logout
 * @desc Logs out the User
 * @access private
 */
export const Logout = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
    await User.findByIdAndUpdate(
        req.user!._id,
        { $set: { refreshToken: null } },
    );

    res.status(200)
    .clearCookie(ACCESS_TOKEN_COOKIE_NAME)
    .clearCookie(REFRESH_TOKEN_COOKIE_NAME)
    .json({
        status: "success",
        message: "Logout Successful",
    });
});

/**
 * @route GET /auth/refresh-token
 * @desc Refreshes the Access Token of the User
 * @access private
 */
export const RefreshAccessToken = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
    const incomingRefreshToken = req.signedCookies[REFRESH_TOKEN_COOKIE_NAME];
    if (!incomingRefreshToken) {
        res.status(400).json({
            status: "error",
            message: "Refresh Token not Found",
            data: null,
        });
        return;
    }

    const decodedToken = jwt.verify(
        incomingRefreshToken,
        env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById((decodedToken as jwt.JwtPayload)?._id).select("-password");

    if (!user) {
        res.status(401).json({
            status: "error",
            message: "Invalid Refresh Token",
            data: null,
        });
        return;
    } else if (incomingRefreshToken !== user?.refreshToken) {
        res.status(401).json({
            status: "error",
            message: "Refresh Token is expired or used",
            data: null,
        });
        return;
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    res.status(200)
    .cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {...cookieOptions, maxAge: ms(env.ACCESS_TOKEN_EXPIRY as StringValue) })
    .cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {...cookieOptions, maxAge: ms(env.REFRESH_TOKEN_EXPIRY as StringValue) })
    .json({
        status: "success",
        message: "Access Token refreshed",
        data: user.username,
    });
});

/**
 * @route PATCH auth/edit/username
 * @desc Edit the Username of the Logged In User
 * @access private
 */
export const ChangeUsername = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
    const { username, password } = req.body;

    const user = await User.findById(req.user!._id).select("-refreshToken");
    if (!user)
        throw new Error("User not found");

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        res.status(401).json({
            status: "error",
            message: "Incorrect Password",
        });
        return;
    }

    const usersWithSameUsername = await User.find({ username: username.toLowerCase() }).limit(1);
    if (usersWithSameUsername.length > 0 && usersWithSameUsername[0] && usersWithSameUsername[0].id !== user.id) {
        res.status(422).json({
            status: "error",
            message: "Username already exists",
            data: null,
        });
        return;
    }

    user.username = username;
    await user.save();

    res.status(200)
    .clearCookie(CSRF_COOKIE_NAME)
    .json({
        status: "success",
        message: "Username changed successfully",
        data: user.username,
    });
});

/**
 * @route PATCH auth/edit/email
 * @desc Edit the Email of the Logged In User
 * @access private
 */
export const ChangeEmail = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
    const { email, password } = req.body;

    const user = await User.findById(req.user!._id).select("-refreshToken");
    if (!user)
        throw new Error("User not found");

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        res.status(401).json({
            status: "error",
            message: "Incorrect Password",
        });
        return;
    }

    user.email = email;
    await user.save();

    res.status(200).json({
        status: "success",
        message: "Email changed successfully"
    });
});

/**
 * @route PATCH auth/edit/password
 * @desc Edit the Password of the Logged In User
 * @access private
 */
export const ChangePassword = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user!._id);
    if (!user)
        throw new Error("User not found");

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
        res.status(401).json({
            status: "error",
            message: "Incorrect Password",
        });
        return;
    }

    user.password = newPassword;
    await user.save();

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    res.status(200)
    .cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {...cookieOptions, maxAge: ms(env.ACCESS_TOKEN_EXPIRY as StringValue) })
    .cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {...cookieOptions, maxAge: ms(env.REFRESH_TOKEN_EXPIRY as StringValue) })
    .clearCookie(CSRF_COOKIE_NAME)
    .json({
        status: "success",
        message: "Password changed successfully",
    });
});

/**
 * @route DELETE auth/delete
 * @desc Delete the Logged In User's Account
 * @access private
 */
export const DeleteUser = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
    // TODO: Set the User as Deleted and delete after 30 days, if User signs in again remove the deletion
    const { password } = req.body;

    const user = await User.findById(req.user!._id).select("-refreshToken");
    if (!user)
        throw new Error("User not found");

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        res.status(401).json({
            status: "error",
            message: "Incorrect Password",
        });
        return;
    }

    await user.deleteOne();
    res.status(200)
    .clearCookie(ACCESS_TOKEN_COOKIE_NAME)
    .clearCookie(REFRESH_TOKEN_COOKIE_NAME)
    .clearCookie(CSRF_COOKIE_NAME)
    .json({
        status: "success",
        message: "Deleted the User",
    });
});
