import mongoose from "mongoose";
import { userDb } from "../config/databaseConfig.js";

const tempChangeSchema = new mongoose.Schema({
  verificationCode: {
    type: String,
    max: 20,
  },
  change: {
    type: String,
  },
  type: {
    type: String,
    required: true,
    default : "text",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expireAfterSeconds: 900 },
  }, // expires after 15 minutes
});

tempChangeSchema.index({ change: 1, type: 1 }, { unique: true });

export default userDb.model("temporary-change", tempChangeSchema);
