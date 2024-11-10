import mongoose from "mongoose";
import Deck from "./deck.model";

interface ICard {
    question: string;
    answer: string;
    hint: string;
    deck: mongoose.Schema.Types.ObjectId;
}

interface ICardMethods {
    isAccessibleBy(user: mongoose.Schema.Types.ObjectId): boolean;
    isEditableBy(user: mongoose.Schema.Types.ObjectId): boolean;
}

type CardModel = mongoose.Model<ICard, unknown, ICardMethods>;

const cardSchema = new mongoose.Schema<ICard, CardModel, ICardMethods>({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    hint: {
        type: String
    },
    deck: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "deck",
        required: true
    }
});

cardSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    await Deck.updateOne(
        { _id: this.deck },
        { $pull: { cards: this._id } }
    );
    next();
});

export default mongoose.model("card", cardSchema);
