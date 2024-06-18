import {
  createHunt,
  getAllHunts,
  getHuntOptionsById,
  getHuntStatusById,
  joinHuntById,
  updateHuntOptionsById,
} from "../controllers/Hunt/HuntController.js";
import { Verify, VerifyRole } from "../middleware/verify.js";
import express from "express";

const router = express.Router();
router.get("/:huntId/options", Verify, getHuntOptionsById);
///admin required
router.put("/:huntId/options", Verify, VerifyRole, updateHuntOptionsById);

router.get("/:huntId/status", Verify, getHuntStatusById);

router.get("/getAllHunts", Verify, getAllHunts);

router.get("/:huntId/join", Verify, joinHuntById)

router.post("/createHunt", Verify, createHunt);
export default router;
