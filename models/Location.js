import mongoose from "mongoose";
import { poiDb } from "../config/databaseConfig.js";
import { ObjectId } from "mongodb";
import Answer from "./Response.js";
import Hunt from "./Hunt.js";
import User from "./User.js";
const LocationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  imgSrc: {
    type: String,
    required: true,
    trim: true,
  },
  question: {
    type: String,
    required: true,
    trim: true,
  },
  answer: {
    type: String,
    required: true,
    trim: true,
  },
  radius: {
    type: Number,
    default: 130,
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  town: {
    type: String,
    trim: true,
  },
  author_id: {
    type: ObjectId,
    ref: User,
  },
  hunts: [
    {
      type: ObjectId,
      ref: "hunts",
    },
  ],
});

LocationSchema.pre("findOneAndDelete", { query: true }, async function (next) {
  const locationId = this.getQuery()._id;
  console.log("Deleting location " + locationId);

  try {
    // Remove related hunts and answers
    await Hunt.updateMany(
      { location_ids: locationId },
      { $pull: { location_ids: locationId } }
    );

    await Answer.deleteMany({ locationId });

    next();
  } catch (err) {
    next(err);
  }
});

export default poiDb.model("locations", LocationSchema);
