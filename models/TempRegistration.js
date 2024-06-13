import mongoose from "mongoose";
import { userDb } from "../config/databaseConfig.js";

const registrationSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: "Your firstname is required",
        max: 25,
    },
    last_name: {
        type: String,
        required: "Your lastname is required",
        max: 25,
    },
    town: {
        type: String,
        required: "Your town is required",
        max: 20,
    },
    email: {
        type: String,
        required: "Your email is required",
        unique: true,
        lowercase: true,
    },
    password: { type: String, required: true, max: 40, },
    verificationCode: String,
    createdAt: { type: Date, default: Date.now, index: { expireAfterSeconds: 900 } } // expires after 15 minutes
});

export default userDb.model("temporary-registration", registrationSchema);