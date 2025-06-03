import mongoose from "mongoose";
import Deck from "./deck.model";
import { UNCATEGORISED_DECK_NAME } from "@/constants";

export type UserRole = "user" | "admin" | `tester_${string}`;

export interface IUser {
    fullName: string;
    username: string;
    email: string;
    emailVerified: Date;
    image: string;
    roles: UserRole[]; // TODO: Move Roles to somewhere such that db is not always required
}

type UserModel = mongoose.Model<IUser>;

const userSchema = new mongoose.Schema<IUser, UserModel>({
    fullName: {
        type: String,
    },
    username: {
        type: String,
        require: true,
        index: true,
        unique: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    emailVerified: {
        type: Date,
        default: null
    },
    image: {
        type: String,
        default: null
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
    next();
});

userSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    await Deck.deleteMany({ owner: this._id });
    next();
});

export default mongoose.model("user", userSchema);
