import mongoose from "mongoose";
import { huntDb } from "../config/databaseConfig.js";
import { ObjectId } from "mongodb";

const HuntSchema = new mongoose.Schema(
  {
    huntName: {
      type: String,
      required: true,
      trim: true,
    },
    townName: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    author_id: {
      type: ObjectId,
      required: true,
      ref: "user_infos",
    },
    location_ids: [
      {
        type: ObjectId,
        ref: "locations",
      },
    ],
    answer_ids: [
      {
        type: ObjectId,
        ref: "answers",
      },
    ],
    participating_user_ids: [
      {
        type: ObjectId,
        ref: "user_infos",
      },
    ],
  },
  { timestamps: true }
);

export default huntDb.model("hunts", HuntSchema);
