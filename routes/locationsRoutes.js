import express from "express";
import { createLocation,editLocation,deleteLocation,getAllLocations, getAllLocationsByAuthorId, getAllLocationsByUserHuntId, getAllLocationsByHuntId } from "../controllers/Location/LocationsController.js";
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

// Get all locations for the users's hunt
router.get("/locations/huntid",Verify,getAllLocationsByUserHuntId);

// Get all locations for a specific hunt
router.get("/locations/huntid/:huntId",Verify,getAllLocationsByHuntId);

// Get all locations created by a user

router.get("/locations/authorid",Verify,getAllLocationsByAuthorId);
export default router;