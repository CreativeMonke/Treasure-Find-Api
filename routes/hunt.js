import { Verify, VerifyRole } from "../middleware/verify.js";
import express from "express";

import { getHuntOptions, updateHuntOptions } from "../controllers/Hunt/HuntController.js";

const router = express.Router();
///No user login required
router.get("/globalInfo", getHuntOptions);
///admin required
router.put("/edit", Verify, VerifyRole, updateHuntOptions);

export default router;