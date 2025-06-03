import type {
    Request as ExpressRequest,
    Response as ExpressResponse
} from "express";
import User from "@/models/user.model";
import {
    ACCESS_TOKEN_COOKIE_NAME,
    REFRESH_TOKEN_COOKIE_NAME,
    CSRF_COOKIE_NAME
} from "@/constants";
import { tryCatch } from "@/utils/wrappers";

/**
 * @route PATCH auth/edit/username
 * @desc Edit the Username of the Logged In User
 * @access private
 */
export const ChangeUsername = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
    const { username } = req.body;

    const user = await User.findById(req.locals!.session!.user!.id!).select("-roles");
    if (!user)
        throw new Error("User not found");

    // TODO: Revalidate User with OAuth Service

    const usersWithSameUsername = await User.find({ username: username.toLowerCase() }).limit(1);
    if (usersWithSameUsername.length > 0 && usersWithSameUsername[0].id !== user.id) {
        res.status(422).json({
            status: "error",
            message: "Username already exists",
            data: null
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
        data: user.username
    });
});

/**
 * @route DELETE auth/delete
 * @desc Delete the Logged In User's Account
 * @access private
 */
export const DeleteUser = tryCatch(async (req: ExpressRequest, res: ExpressResponse) => {
    // TODO: Set the User as Deleted and delete after 30 days, if User signs in again remove the deletion
    const user = await User.findById(req.locals!.session!.user!.id!).select("-refreshToken");
    if (!user)
        throw new Error("User not found");

    // TODO: Revalidate User with OAuth Service

    await user.deleteOne();
    res.status(200)
    .clearCookie(ACCESS_TOKEN_COOKIE_NAME)
    .clearCookie(REFRESH_TOKEN_COOKIE_NAME)
    .clearCookie(CSRF_COOKIE_NAME)
    .json({
        status: "success",
        message: "Deleted the User"
    });
});
