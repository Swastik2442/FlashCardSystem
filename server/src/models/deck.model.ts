import mongoose from "mongoose";
import Card from "./card.model";

interface IDeck {
    owner: mongoose.Schema.Types.ObjectId;
    name: string;
    description: string;
    dateCreated: Date;
    dateUpdated: Date;
    isPrivate: boolean;
    sharedTo: {
        user: mongoose.Schema.Types.ObjectId;
        editable: boolean;
    }[],
    likes: number;
    likedBy: mongoose.Schema.Types.ObjectId[];
}

interface IDeckAccessible {
    readable: boolean;
    writable: boolean;
}

interface IDeckMethods {
    isAccessibleBy(userID: mongoose.Schema.Types.ObjectId): IDeckAccessible;
}

type DeckModel = mongoose.Model<IDeck, {}, IDeckMethods>;

const deckSchema = new mongoose.Schema<IDeck, DeckModel, IDeckMethods>({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    dateUpdated: {
        type: Date,
        default: Date.now
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    sharedTo: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        editable: {
            type: Boolean,
            default: false
        }
    }],
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ]
});

deckSchema.pre("save", async function(next) {
    this.dateUpdated = new Date();
    next();
});

deckSchema.pre("deleteOne", { document: true, query: false }, async function(next) {
    await Card.deleteMany({ deck: this._id });
    next();
});

deckSchema.pre("deleteMany", async function(next) {
    const decks = await this.model.find(this.getFilter());
    for (const deck of decks) {
        await Card.deleteMany({ deck: deck._id });
    }
    next();
});

deckSchema.methods.isAccessibleBy = function(userID: mongoose.Schema.Types.ObjectId) {
    if (String(this.owner) === String(userID))
        return { readable: true, writable: true };

    const sharedUser = this.sharedTo.find((sharedUser) => String(sharedUser.user) === String(userID));
    if (sharedUser)
        return { readable: true, writable: sharedUser.editable };

    if (!this.isPrivate)
        return { readable: true, writable: false };

    return { readable: false, writable: false };
};

export default mongoose.model("deck", deckSchema);
