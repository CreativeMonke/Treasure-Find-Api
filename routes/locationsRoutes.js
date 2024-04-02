import express from "express";
import { createLocation,editLocation,deleteLocation,getAllLocations } from "../controllers/Location/LocationsController.js";
import locateMiddleware from '../middleware/locate.js';

import { Verify,VerifyRole } from "../middleware/verify.js";
const router = express.Router();

// Create a new location -> Admin Only

router.post("/locations/create",Verify,VerifyRole,createLocation);

// Update a location -> Admin Only

router.put("/locations/edit/:id",Verify,VerifyRole,locateMiddleware,editLocation);

// Delete a location -> Admin Only

router.delete("/locations/delete/:id",Verify,VerifyRole,locateMiddleware,deleteLocation);

// Get all locations -> Any User

router.get("/locations/all",Verify,getAllLocations);

export default router;