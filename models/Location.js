import mongoose from "mongoose";
import { poiDb } from "../config/databaseConfig.js";
import { ObjectId } from "mongodb";

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
  town:{
    type: String,
    trim: true,
  },
  author_id:{
    type: ObjectId,
    ref: "user_infos",
  },
  hunts: [
    {
      type: ObjectId,
      ref: "hunts",
    },
  ],
});

export default poiDb.model("locations", LocationSchema);
