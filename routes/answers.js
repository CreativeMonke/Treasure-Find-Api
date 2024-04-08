import { check } from "express-validator";
import { Verify, VerifyRole } from "../middleware/verify.js";
import express from "express";

import { submitAnswer, getAnswersByLocationId, getAnswersByUserId, updateAnswerValidity, getAnswer, updateAnswerById } from "../controllers/Response/AnswerController.js";

const router = express.Router();

//Create a new answer

router.post("/submit",
    check("question")
        .not()
        .isEmpty()
        .withMessage("Please enter a valid question"),
    check("answer")
        .not()
        .isEmpty()
        .withMessage("Please enter a valid answer answer")
        .isLength({ min: 5, max: 200 })
        .withMessage("The answer must be between 5 and 200 characters"),
    Verify, VerifyRole, submitAnswer);

//get the answers by location id

router.get("/getAnswersByLocationId/:locationId", Verify, VerifyRole, getAnswersByLocationId);

//get the answers by user id

router.get("/getAnswersByUserId", Verify, VerifyRole, getAnswersByUserId);

//update the answer validity

router.post("/updateAnswerValidity/:answerId", Verify, VerifyRole, updateAnswerValidity);

///edit the answer Answer and isValid fields

router.put("/updateAnswerById/:answerId", Verify, updateAnswerById);

///get answer by location and user id's

router.get("/getAnswer/:locationId", Verify, getAnswer);

export default router;