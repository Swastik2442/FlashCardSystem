import mongoose from "mongoose";

const deckSchema = new mongoose.Schema({
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
        type: String
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
    private: {
        type: Boolean,
        default: false
    },
    sharedTo: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ],
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

export default mongoose.model("deck", deckSchema);
