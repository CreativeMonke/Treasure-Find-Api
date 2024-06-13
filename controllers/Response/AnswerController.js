import { SECRET_ACCES_TOKEN } from "../../config/index.js";
import Answer from "../../models/Response.js";
import Location from "../../models/Location.js";
import jwt from "jsonwebtoken";
import { evaluateResponse } from "./AiCheck.js";
import { getHuntStatusById } from "../Hunt/HuntController.js";
import mongoose from "mongoose";
import { huntDb } from '../../config/databaseConfig.js';

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

export async function submitAnswer(req, res) {
    try {
        const { question, answer, locationId, huntId } = req.body;
        const userId = req.user._id;

        if (!isValidObjectId(userId) || !isValidObjectId(locationId) || !isValidObjectId(huntId)) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid ID format.",
            });
        }

        // Check to see if the user already responded
        const existingAnswer = await Answer.findOne({
            userId: userId,
            locationId: locationId,
            huntId: huntId,
        });
        if (existingAnswer) {
            return res.status(400).json({
                status: "failed",
                message: "You have already submitted an answer for this location in this hunt!",
            });
        }

        // Check to see if the location exists
        const location = await Location.findById(locationId);
        if (!location) {
            return res.status(404).json({
                status: "failed",
                message: "Location not found!",
            });
        }

        const newAnswer = new Answer({
            question: question,
            answer: answer,
            correctAnswer: location.answer,
            userId: userId,
            locationId: locationId,
            huntId: huntId,
        });

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
}

export async function getAnswersByLocationId(req, res) {
    try {
        const { locationId } = req.params;
        if (!isValidObjectId(locationId)) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid location ID format.",
            });
        }
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
        const userId = req.user._id;
        const { huntId } = req.params;

        if (!isValidObjectId(userId) || !isValidObjectId(huntId)) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid ID format.",
            });
        }

        const huntStatus = await getHuntStatusById({ params: { huntId } });
        const hunt = await huntDb.collection('hunts').findOne({ _id: new ObjectId(huntId) });
        let excludes = { correctAnswer: 0, evaluationScore: 0 };

        if (huntStatus.status === 'ended' && hunt.answersReady) {
            excludes = {}; // Removing the projection limitations
        }

        const answers = await Answer.find({ userId: userId, huntId: huntId }, excludes);
        return res.status(200).json({
            status: "success",
            data: answers,
        });
    } catch (err) {
        console.error('Error fetching user answers:', err);
        return res.status(500).json({
            status: "error",
            data: [err.message],
            message: "Internal Server Error",
        });
    }
}

export async function getNumberOfCorrectAnswers(req, res) {
    try {
        const userId = req.user._id;
        const { huntId } = req.params;

        if (!isValidObjectId(userId) || !isValidObjectId(huntId)) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid ID format.",
            });
        }

        const answers = await Answer.find({ userId: userId, huntId: huntId });
        let count = 0;
        answers.forEach((answer) => {
            if (answer.isCorrectFinalEvaluation) {
                count++;
            }
        });

        return res.status(200).json({
            status: "success",
            numberOfCorrectAnswers: count,
            numberOfAnswers: answers.length,
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
        const userId = req.user._id;
        const { huntId } = req.params;

        if (!isValidObjectId(locationId) || !isValidObjectId(userId) || !isValidObjectId(huntId)) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid ID format.",
            });
        }

        const answer = await Answer.findOne({ locationId: locationId, userId: userId, huntId: huntId });
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
    const questionShownAt = new Date(answer.createdAt);
    const answerSubmittedAt = new Date();
    const differenceInSeconds = (answerSubmittedAt - questionShownAt) / 1000;
    return differenceInSeconds;
}

export async function updateAnswerById(req, res) {
    const { answerId } = req.params;
    const { huntId } = req.body;

    if (!isValidObjectId(answerId) || !isValidObjectId(huntId)) {
        return res.status(400).json({
            status: "failed",
            message: "Invalid ID format.",
        });
    }

    const updates = req.body;
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
        if (answer.hasBeenUpdated) {
            return res.status(409).json({
                status: "failed",
                message: "Answer has already been modified!",
            });
        } else {
            answer.hasBeenUpdated = true;
        }

        const age = answerAge(answer);
        if (age > 5 * 60) {
            return res.status(400).json({
                status: "failed",
                message: "Question is not open for answers!",
            });
        }

        actualUpdated.forEach((key) => {
            answer[key] = updates[key];
        });
        await answer.save();

        const correctAnswers = answer.correctAnswer.split(';');
        answer.evaluationScore = await evaluateResponse(answer.answer, correctAnswers);
        if (answer.evaluationScore >= 80) {
            answer.isCorrectFinalEvaluation = true;
        }
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
        const { answerId } = req.params;
        if (!isValidObjectId(answerId)) {
            return res.status(400).json({
                status: "failed",
                message: "Invalid answer ID format.",
            });
        }
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

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function checkAllAnswers(req, res) {
    try {
        const answersToEvaluate = await Answer.find({
            $or: [
                { evaluationScore: { $gte: 60, $lt: 80 }, answer: { $ne: " " } },
                { evaluationScore: -1, answer: { $ne: " " } }
            ]
        });

        for (let answer of answersToEvaluate) {
            if (answer.evaluationScore === -1) {
                const correctAnswers = answer.correctAnswer.split(';');
                answer.evaluationScore = await evaluateResponse(answer.answer, correctAnswers);
            }
            if (answer.evaluationScore >= 80) {
                answer.isCorrectFinalEvaluation = true;
            } else {
                answer.isCorrectFinalEvaluation = false;
            }
            await answer.save();
            await delay(1500);
        }

        return res.status(200).json({
            status: "success",
            message: `Evaluated ${answersToEvaluate.length} answers.`
        });
    } catch (err) {
        console.error('Error evaluating answers:', err);
        return res.status(500).json({
            status: "error",
            message: "Internal Server Error",
            data: err.message
        });
    }
}
