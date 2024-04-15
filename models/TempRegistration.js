// models/TemporaryRegistration.js
import mongoose from "mongoose";
import { userDb } from "../config/databaseConfig.js";

const registrationSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    town: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    verificationCode: String,
    createdAt: { type: Date, default: Date.now, index: { expireAfterSeconds: '900' } } // expires after 15 minutes
});

export default userDb.model("temporary-registration", registrationSchema);