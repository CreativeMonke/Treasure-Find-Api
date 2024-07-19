import {
  createHunt,
  deleteHuntById,
  exitHuntByHuntId,
  exitHuntByUserHuntId,
  getAllHunts,
  getCurrentHuntByUserId,
  getHuntOptionsById,
  getHuntStatusById,
  joinHuntById,
  updateHuntOptionsById,
} from "../controllers/Hunt/HuntController.js";
import { Verify, VerifyOwnership, VerifyRole } from "../middleware/verify.js";
import express from "express";

const router = express.Router();
router.get("/:huntId/options", Verify, getHuntOptionsById);
///admin required
router.put("/:huntId/edit", Verify, VerifyOwnership, updateHuntOptionsById);

router.get("/:huntId/status", Verify, getHuntStatusById);

router.get("/getAllHunts", Verify, getAllHunts);

router.get("/getCurrentHunt" , Verify, getCurrentHuntByUserId);

router.get("/:huntId/join", Verify, joinHuntById);

router.post("/createHunt", Verify, createHunt);

router.get("/:huntId/delete", Verify, VerifyOwnership, deleteHuntById);

router.get("/exitCurrentHunt", Verify, exitHuntByUserHuntId);

router.get("/:huntId/exit", Verify, exitHuntByHuntId);
export default router;
