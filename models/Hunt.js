import mongoose from "mongoose";
import { huntDb } from "../config/databaseConfig.js";
import { ObjectId } from "mongodb";
import User from "./User.js";
import Location from "./Location.js";
import Answer from "./Response.js";
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
      ref: User,
    },
    location_ids: [
      {
        type: ObjectId,
        ref: Location,
      },
    ],
    answer_ids: [
      {
        type: ObjectId,
        ref: Answer,
      },
    ],
    areAnswersReady: {
      type: Boolean,
      default: false,
    },
    participating_user_ids: [
      {
        type: ObjectId,
        ref: User,
      },
    ],
  },
  { timestamps: true }
);

HuntSchema.post(
  "deleteOne",
  { document: true, query: true },

  async function (next) {
    const huntId = this._conditions._id;
    console.log("Deleting hunt " + huntId);
    try {
      // Remove related answers
      await Answer.deleteMany({ huntId });

      // Update user references
      await User.updateMany(
        {
          $or: [
            { createdHuntIds: huntId },
            { "huntState.huntId": huntId },
            { currentHuntId: huntId },
          ],
        },
        {
          $pull: {
            createdHuntIds: huntId,
            huntState: { huntId },
          },
          $unset: {
            currentHuntId: "",
          },
        }
      );

      // Update location references
      await Location.updateMany(
        { hunts: huntId },
        { $pull: { hunts: huntId } }
      );
    } catch (err) {
      console.log(err);
    }
  }
);

export default huntDb.model("hunts", HuntSchema);
