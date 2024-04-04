import mongoose from "mongoose";
import { responsesDb } from "../config/databaseConfig.js";
import { ObjectId } from "mongodb";

const answerSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    userId: {
        type: ObjectId,
        required: true
    },
    locationId: {
        type: ObjectId,
        required: true
    },
    isValid: {
        type: Boolean,
        default: false,
        required: true
    },

}, { timestamps: true });

answerSchema.index({ userId: 1, locationId: 1 }, { unique: true });


export default responsesDb.model("answers", answerSchema);