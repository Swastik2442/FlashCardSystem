import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import Deck from "./deck.model.js";
import { UNCATEGORISED_DECK_NAME } from "../constants.js";
import env from "../env.js";

export type UserRole = "user" | "admin" | `tester_${string}`;

export interface IUser {
    fullName: string;
    email: string;
    username: string;
    password: string;
    refreshToken: string;
    roles: UserRole[];
}

export interface IUserMethods {
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

type UserModel = mongoose.Model<IUser, unknown, IUserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
    fullName: {
        type: String,
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    username: {
        type: String,
        require: true,
        index: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    refreshToken: {
        type: String,
        default: undefined
    },
    roles: {
        type: [String],
        default: ["user"] as UserRole[]
    }
});

userSchema.pre("save", async function (next) {
    if (this.isNew) {
        const userDeck = await Deck.create({
            owner: this._id,
            name: UNCATEGORISED_DECK_NAME,
            isPrivate: true
        });
        await userDeck.save();
    }
    if (this.isModified("password"))
        this.password = await bcrypt.hash(this.password, 10);

    next();
});

userSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    await Deck.deleteMany({ owner: this._id });
    next();
});

userSchema.methods.isPasswordCorrect = async function(password: string) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: env.ACCESS_TOKEN_EXPIRY
        }
    )
};

userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id,
        },
        env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: env.REFRESH_TOKEN_EXPIRY
        }
    )
};

export default mongoose.model("user", userSchema);
