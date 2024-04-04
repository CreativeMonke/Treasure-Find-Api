import { SECRET_ACCES_TOKEN } from "../../config/index.js";
import Answer from "../../models/Response.js"
import jwt from "jsonwebtoken";
export async function submitAnswer(req, res) {
    try {
        const { question, answer, locationId } = req.body;
        const token = req.cookies.SessionID;
        if (!token) {
            return res.status(401).json({
                status: "failed",
                message: "Please log in!",
            });
        }
        const decoded = jwt.verify(token, SECRET_ACCES_TOKEN);
        const userId = decoded.id;
        const newAnswer = new Answer({
            question: question,
            answer: answer,
            userId: userId,
            locationId: locationId,
        });
        ///Check to see if the user already responded
        const existingAnswer = await Answer.findOne({
            userId: userId,
            locationId: locationId,
        });
        if (existingAnswer) {
            return res.status(400).json({
                status: "failed",
                message: "You have already submitted an answer for this location!",
            });
        }
        ///Check to see if the location exists
        const location = await Location.findById(locationId);
        if (!location) {
            return res.status(404).json({
                status: "failed",
                message: "Location not found!",
            });
        }
        ///Check to see if the user is the owner of the location
        const user = await User.findById(userId);
        if (user.team !== location.team) {
            return res.status(403).json({
                status: "failed",
                message: "You are not the owner of this location!",
            });
        }
        const savedAnswer = await newAnswer.save();
        return res.status(200).json({
            status: "success",
            data: savedAnswer,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: "error",
            data: [err],
            message: "Internal Server Error",
        });
    }
    res.end();
}

export async function getAnswersByLocationId(req, res) {
    try {
        const { locationId } = req.params;
        const answers = await Answer.find({ locationId: locationId });
        return res.status(200).json({
            status: "success",
            data: answers,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: "error",
            data: [err],
            message: "Internal Server Error",
        });
    }
}

export async function getAnswersByUserId(req, res) {
    try {
        const token = req.cookies.SessionId;
        if (!token) {
            return res.status(401).json({
                status: "failed",
                message: "Please log in!",
            });
        }
        const decoded = jwt.verify(token, SECRET_ACCES_TOKEN);
        const userId = decoded.id;
        const answers = await Answer.find({ userId: userId });
        return res.status(200).json({
            status: "success",
            data: answers,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: "error",
            data: [err],
            message: "Internal Server Error",
        });
    }
}
///modifyAnswerCorrectness function that has a more friendly name
export async function updateAnswerValidity(req, res) {
    try {
        const { answerID } = req.params;
        const { isValid } = req.body;
        const answer = await Answer.findById(answerId);
        answer.isValid = isValid;
        const updatedAnswer = await answer.save();
        res.status(200).json({
            status: "success",
            data: updatedAnswer,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
        });
    }
}