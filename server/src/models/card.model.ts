import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
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
    }
});

export default mongoose.model("card", cardSchema);
