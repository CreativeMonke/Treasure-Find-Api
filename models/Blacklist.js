///Log out login
///-> By blacklisting user cookie
import { userDb } from "../config/databaseConfig.js"
import mongoose from "mongoose";

const BlacklistSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
            ref: "User",
        },
    }, { timestamps: true }
);
export default userDb.model("blacklist", BlacklistSchema);