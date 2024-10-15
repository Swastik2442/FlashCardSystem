import mongoose from "mongoose";
import Card from "./card.model";

interface IDeck {
    owner: mongoose.Schema.Types.ObjectId;
    name: string;
    description: string;
    dateCreated: Date;
    dateUpdated: Date;
    cards: mongoose.Schema.Types.ObjectId[];
    isPrivate: boolean;
    sharedTo: {
        user: mongoose.Schema.Types.ObjectId;
        editable: boolean;
    }[],
    likes: number;
    likedBy: mongoose.Schema.Types.ObjectId[];
}

interface IDeckMethods {
    isAccessibleBy(user: mongoose.Schema.Types.ObjectId): boolean;
    isEditableBy(user: mongoose.Schema.Types.ObjectId): boolean;
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
    cards: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "card"
        }
    ],
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

deckSchema.pre("deleteOne", { document: true, query: false }, async function(next) {
    await Card.deleteMany({ deck: this._id });
    next();
});

// TODO: Implement deleteMany Pre Hook (this._conditions is not available in query?)

deckSchema.methods.isAccessibleBy = function(user: mongoose.Schema.Types.ObjectId) {
    return this.owner == user || this.sharedTo.some((sharedUser) => sharedUser.user == user);
};

deckSchema.methods.isEditableBy = function(user: mongoose.Schema.Types.ObjectId) {
    return this.owner == user || this.sharedTo.some((sharedUser) => sharedUser.user == user && sharedUser.editable);
};

export default mongoose.model("deck", deckSchema);
