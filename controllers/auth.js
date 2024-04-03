import User from "../models/User.js";
import bcrypt from "bcrypt";
import Blacklist from "../models/Blacklist.js";
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
            maxAge: 60 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: "None",
        };

        const token = user.generateAccessJWT();
        res.cookie("SessionID", token, options);

        const { password, ...user_data } = user._doc;
        return res.status(200).json({
            status: "succes",
            data: [user_data],
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

export async function Register(req, res) {
    const { first_name, last_name, email, password } = req.body;
    try {
        const newUser = new User({
            first_name,
            last_name,
            email,
            password,
        });

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({
                status: "failed",
                data: [],
                message: "An account with that email already exists!",
            });
        const savedUser = await newUser.save();
        const { role, ...user_data } = savedUser._doc;
        console.log(savedUser);
        res.status(200).json({
            status: "success",
            data: [user_data],
            message:
                "Thank you for registering with us. Your account has been successfully created.",
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
    res.end();
}

export async function Logout(req, res) {
    try {
        const authHeader = req.headers["cookie"];
        if (!authHeader)
            return res.sendStatus(204);
        const cookie = authHeader.split("=")[1];
        const accessToken = cookie.split(";")[0];
        const checkIfBlacklist = await Blacklist.findOne({token : accessToken});
        
        if(checkIfBlacklist)
        return res.sendStatus(204);
        
        const newBlacklist = new Blacklist({
            token : accessToken,
        });
        await newBlacklist.save();

        res.setHeader("Clear-Site-Data",`"cookies"`);
        res.status(200).json({
            message: "You are logged out!",
        });
    } catch(err)
    {
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
    res.end();
}

export async function checkLogin(req, res){
    try {
        res.status(200).json({
            message: "Go for login",
        });
    } catch(err)
    {
        res.status(500).json({
            status: "error",
            data: {message: err},
            message: "Internal Server Error",
        });
    }
    res.end();
}