import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { SECRET_ACCES_TOKEN } from "../config/index.js";
import Blacklist from "../models/Blacklist.js";

export async function Verify(req, res, next) {
    try {
        const accessToken = req.headers["sessionid"];
        console.log(accessToken);
        if (!accessToken) return res.status(403).json({
            status: "failed",
            data: [],
            message: "No auth token found",
        });
        const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken });
        if (checkIfBlacklisted)
            return res.status(401).json({
                status: "invalid",
                message: "This session has expired. Please login"
            });
        ///Daca exista, mentine doar jwt-ul
        jwt.verify(accessToken, SECRET_ACCES_TOKEN, async (err, decoded) => {
            if (err)
                return res.status(401).json({
                    status: "invalid",
                    message: "This session has expired. Please log in!",
                });
                console.log(decoded);
            const { id } = decoded;
            const user = await User.findById(id);
            const { password, ...data } = user._doc;
            req.user = data;
            next();
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            code: 500,
            data: [err],
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
            data: [err],
            message: "Internal Server Error",
        });
    }
}