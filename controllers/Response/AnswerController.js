import { SECRET_ACCES_TOKEN } from "../../config/index.js";
import Answer from "../../models/Response.js"
import Location from "../../models/Location.js";
import jwt from "jsonwebtoken";
export async function submitAnswer(req, res) {
    try {
        const { question, answer, locationId } = req.body;
        const token = req.headers.sessionid;
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
            message: "Internal Server Error",
        });
    }
}



export async function getAnswersByUserId(req, res) {
    try {
        const token = req.headers.sessionid;
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
export async function getAnswer(req, res) {
    try {
        const { locationId } = req.params;
        const token = req.headers.sessionid;
        const decoded = jwt.verify(token, SECRET_ACCES_TOKEN);
        const userId = decoded.id;

        const updates = req.body;
        console.log(updates);
        const allowedUpdated = ["answer", "isValid"];
        const answer = await Answer.findOne({ locationId: locationId, userId: userId });
        if (!answer) {
            return res.status(404).json({
                status: "failed",
                message: "Answer not found!",
            });
        }
        return res.status(200).json({
            status: "success",
            data: answer,
            message: "Answer retrieved successfully!",
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

function answerAge(answer) {
    const questionShownAt = new Date(answer.createdAt); // Parse the ISO string to a Date object
    const answerSubmittedAt = new Date(); // Current time as a Date object
    const differenceInSeconds = (answerSubmittedAt - questionShownAt) / 1000;

    return differenceInSeconds;
}

export async function updateAnswerById(req, res) {
    const { answerId } = req.params;
    const updates = req.body;
    //console.log(updates);
    const allowedUpdated = ["answer", "question"];
    const actualUpdated = Object.keys(updates).filter(key => allowedUpdated.includes(key));

    const answer = await Answer.findById(answerId);
    if (!answer) {
        return res.status(404).json({
            status: "failed",
            message: "Answer not found!",
        });
    }
    try {
        ///Check if the answer has been modified
        /* if (answer.answer != "Waiting for user answer") {
             return res.status(409).json({
                 status: "failed",
                 message: "Answer has already been modified!",
             });
         }
         */
        if (answer.hasBeenUpdated) {
            return res.status(409).json({
                status: "failed",
                message: "Answer has already been modified!",
            });
        }
        else
        answer.hasBeenUpdated = true;
        const age = answerAge(answer);
        if (age > 5 * 60) // 5 minutes

            return res.status(400).json({//Question is not open for answers
                status: "failed",
                message: "Question is not open for answers!",
            });

        actualUpdated.forEach((key) => {
            answer[key] = updates[key];
        });

        await answer.save();
        res.status(200).json({
            status: "success",
            data: answer,
            message: "Answer updated successfully!",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            data: [err],
            message: "Internal Server Error",
        });
    }
}
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
