import { check } from "express-validator";
import { Verify, VerifyRole } from "../middleware/verify.js";
import express from "express";

import { submitAnswer, getAnswersByLocationId, getAnswersByUserId, updateAnswerValidity, getAnswer, updateAnswerById, checkAllAnswers, getNumberOfCorrectAnswersByHuntId } from "../controllers/Response/AnswerController.js";
import { csvAllData } from "../controllers/Response/generateCsv.js";

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
    Verify, submitAnswer);

//get the answers by location id

router.get("/getAnswersByLocationId/:locationId", Verify, VerifyRole, getAnswersByLocationId);

//get the answers by user id

router.get("/getAnswersByUserId", Verify, getAnswersByUserId);

//update the answer validity

router.post("/updateAnswerValidity/:answerId", Verify, VerifyRole, updateAnswerValidity);

///edit the answer Answer and isValid fields

router.put("/updateAnswerById/:answerId", Verify, updateAnswerById);

///get answer by location and user id's

router.get("/getAnswer/:locationId", Verify, getAnswer);

router.get("/getAllAnswers", Verify, VerifyRole, csvAllData);

router.get("/getNumberOfCorrectAnswers/:huntId", Verify, getNumberOfCorrectAnswersByHuntId);

router.get("/checkAllAnswers", Verify,VerifyRole, checkAllAnswers);
export default router;