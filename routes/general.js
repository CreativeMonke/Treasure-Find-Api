import express from "express";
import {
  changePassword,
  getPreviewData,
  resetPassword,
  verifyCode,
} from "../controllers/GeneralFeatures/generalController.js";
import { changeEmail } from "../controllers/auth.js";
import { Verify } from "../middleware/verify.js";
import { sendVerificationEmail } from "../controllers/VerifyEmail/sendVerificationEmail.js";

const router = express.Router();

router.get("/getPreviewData", getPreviewData);

router.post("/changePassword", Verify, changePassword);
router.post("/changeEmail", Verify, changeEmail);
router.post("/resetPassword", resetPassword);
router.post("/sendVerificationEmail", sendVerificationEmail);
router.post("/verifyCode", verifyCode);
export default router;
