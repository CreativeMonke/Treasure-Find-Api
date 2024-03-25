import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { SECRET_ACCES_TOKEN } from "../config/index.js";
import Blacklist from "../models/Blacklist.js";

export async function Verify(req, res, next) {
    try {
        const authHeader = req.headers["cookie"];
        if (!authHeader) return res.sendStatus(401);
        const cookie = authHeader.split("=")[1];
        const accessToken = cookie.split(";")[0];
        const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken });
        if (checkIfBlacklisted)
            return res.status(401).json({ message: "This session has expired. Please login" });
        ///Daca exista, mentine doar jwt-ul
        jwt.verify(accessToken, SECRET_ACCES_TOKEN, async (err, decoded) => {
            if (err)
                return res.status(401).json({
                    message: "This session has expired. Please log in!",
                });

            const { id } = decoded;
            const user = await User.findById(id);
            const { password, ...data } = user._doc;
            req.user = data;
            next();
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
}

export async function VerifyRole(req, res, next) {
    try {
        const user = req.user;
        const { role } = user;
        if (role !== "0x88") {
            return res.status(401).json({
                status: "failed",
                message: "You are not authorized to view this page",
            });
        }
        next();
    } catch (err) {
        return res.status(500).json({
            status: "failed",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
}