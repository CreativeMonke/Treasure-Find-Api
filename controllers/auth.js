import User from "../models/User.js";
import bcrypt from "bcrypt";
import Blacklist from "../models/Blacklist.js";
import TemporaryRegistration from "../models/TempRegistration.js";
import SendVerificationEmail from "./VerifyEmail/verifyMail.js";
export async function Login(req, res) {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email }).select("+password");
        if (!user)
            return res.status(401).json({
                status: "failed",
                data: [],
                message: "Invalid email or password",
            });
        const isPasswordValid = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!isPasswordValid)
            return res.status(401).json({
                status: "failed",
                data: [],
                message: "Invalid email or password",
            });

        let options = {
            maxAge: 5 * 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: "None",
        };

        const token = user.generateAccessJWT();

        const { password, ...user_data } = user._doc;
        return res.status(200).json({
            status: "succes",
            user: [user_data],
            sessionId: token,
            message: "Succesful login",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal server error",
        });
    }
    res.end();
}

// routes/userRoutes.js (or wherever you manage routes)

export async function Register(req, res) {
    const { first_name, last_name, town, email, password } = req.body;
    try {
        const existingUser = await TemporaryRegistration.findOne({ email });
        const existingUserInMain = await User.findOne({ email });
        if (existingUserInMain)
            return res.status(400).json({
                status: "failed",
                message: "An account with that email already exists!",
            });
        if (existingUser)
            return res.status(409).json({
                status: "failed",
                message: "An account with that email is already in the process of being created!",
            });
        //console.log(email);
        const newUser = new TemporaryRegistration({
            first_name,
            last_name,
            town,
            email,
            password
        });
        //console.log(newUser);
        await newUser.save();
        await SendVerificationEmail(newUser);

        res.status(200).json({
            status: "success",
            message: "Please check your email to verify your account.",
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            code: 500,
            message: "Internal Server Error",
        });
    }
}

export async function VerifyEmail(req, res) {
    const { email, verificationCode } = req.body;
    try {
        console.log(email, verificationCode);
        const tempUser = await TemporaryRegistration.findOne({ email, verificationCode });
        console.log(tempUser);
        if (!tempUser) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid verification code or email.",
            });
        }

        const user = new User({
            first_name: tempUser.first_name,
            last_name: tempUser.last_name,
            town: tempUser.town,
            email: tempUser.email,
            password: tempUser.password,
            isEmailVerified: true
        });
        await user.save();
        await TemporaryRegistration.deleteOne({ _id: tempUser._id });
        res.status(200).json({
            status: "success",
            message: "Thank you for registering with us. Your account has been successfully created.",
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
}

export async function Logout(req, res) {
    try {
        const sessionId = req.headers.sessionid;
        if (!sessionId)
            return res.sendStatus(204);
        const checkIfBlacklist = await Blacklist.findOne({ token: sessionId });

        if (checkIfBlacklist)
            return res.sendStatus(204);

        const newBlacklist = new Blacklist({
            token: sessionId,
        });
        await newBlacklist.save();

        res.status(200).json({
            message: "You are logged out!",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
    res.end();
}

export async function checkLogin(req, res) {
    try {
        const sessionId = req.headers.sessionid;
        res.status(200).json({
            message: "Go for login",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err,
        });
    }
    res.end();
}