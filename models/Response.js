import mongoose from "mongoose";
import { responsesDb } from "../config/databaseConfig.js";
import { ObjectId } from "mongodb";

const answerSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    userId: {
      type: ObjectId,
      required: true,
      ref: "user_infos",
    },
    locationId: {
      type: ObjectId,
      required: true,
      ref: "locations",
    },
    huntId: {
      type: ObjectId,
      required: true,
      ref: "hunts",
    },
    evaluationScore: {
      type: Number,
      default: -1,
    },
    isCorrectFinalEvaluation: {
      type: Boolean,
      default: false,
    },
    hasBeenUpdated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

answerSchema.index({ userId: 1, locationId: 1, huntId: 1 }, { unique: true });

export default responsesDb.model("answers", answerSchema);
