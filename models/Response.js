import mongoose from "mongoose";
import { responsesDb } from "../config/databaseConfig.js";
import { ObjectId } from "mongodb";

const answerSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    correctAnswer: {
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
    evaluationScore: {
        type: Number,
        default: 0,
    },
    hasBeenUpdated:{
        type: Boolean,
        default: false,
    },

}, { timestamps: true });

answerSchema.index({ userId: 1, locationId: 1 }, { unique: true });


export default responsesDb.model("answers", answerSchema);