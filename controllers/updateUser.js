import User from "../models/User.js"
import jwt from "jsonwebtoken";
import { SECRET_ACCES_TOKEN } from "../config/index.js";
export async function updateUser(req,res){
    try{
        const token = req.cookies.SessionID;
        if(!token){
            return res.status(401).json({
                status:"failed",
                message:"Please log in!",
            });
        }

        const decoded = jwt.verify(token,SECRET_ACCES_TOKEN);
        console.log("id = "+ decoded.id);
        const userId = decoded.id;
        const updates = req.body;

        const allowedUpdates = ["first_name", "last_name", "team","town"];
        const actualUpdates = Object.keys(updates).filter(key => allowedUpdates.includes(key));

        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({
                status:"failed",
                message: "User not found!",
            });
        }

        actualUpdates.forEach((update) => {
            user[update] = updates[update];
        });

        await user.save();

        const {password, ...updatedUserData} = user._doc;

        res.status(200).json({
            status:"succes",
            data: updatedUserData,
            message: "User data changed succesfully!",
        });
    }catch(err){
        console.error(err);
        res.status(500).json({
            status:"error",
            message:"Internal Server Error",
        });
    }
    res.end();

}