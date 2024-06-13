import {
  getHuntOptionsById,
  getHuntStatusById,
  updateHuntOptionsById,
} from "../controllers/Hunt/HuntController.js";
import { Verify, VerifyRole } from "../middleware/verify.js";
import express from "express";

const router = express.Router();
router.get("/:huntId/options", Verify, getHuntOptionsById);
///admin required
router.put("/:huntId/options", Verify, VerifyRole, updateHuntOptionsById);

router.get("/:huntId/status", Verify, getHuntStatusById);
export default router;
