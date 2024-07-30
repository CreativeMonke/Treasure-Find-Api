import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { SECRET_ACCES_TOKEN } from "../config/index.js";
import Blacklist from "../models/Blacklist.js";

export async function Verify(req, res, next) {
  try {
    const accessToken = req.headers.sessionid;
    if (!accessToken)
      return res.status(403).json({
        status: "failed",
        data: [],
        message: "No auth token found",
      });
    const checkIfBlacklisted = await Blacklist.findOne({ token: accessToken });
    if (checkIfBlacklisted)
      return res.status(401).json({
        status: "invalid",
        message: "This session has expired. Please login",
      });
    ///Daca exista, mentine doar jwt-ul
    jwt.verify(accessToken, SECRET_ACCES_TOKEN, async (err, decoded) => {
      if (err)
        return res.status(401).json({
          status: "invalid",
          message: "This session has expired. Please log in!",
        });
      // console.log(decoded);
      const { id } = decoded;
      const user = await User.findById(id);
      if (!user)
        return res.status(401).json({
          status: "invalid",
          message: "This session has expired. Please log in!",
        });
      const { password, ...data } = user._doc;
      req.user = data;
      next();
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "error",
      code: 500,
      data: [err],
      message: "Internal Server Error",
    });
  }
}

export async function VerifyRole(req, res, next) {
  try {
    const user = req.user;
    const { role } = user;
    if (role < "0x88") {
      return res.status(401).json({
        status: "failed",
        message: "You are not authorized to view this page",
      });
    }
    next();
  } catch (err) {
    return res.status(500).json({
      status: "failed",
      data: [err],
      message: "Internal Server Error",
    });
  }
}

///Verify ownership
export async function VerifyOwnership(req, res, next) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        status: "failed",
        message: "Unauthorized: User not found",
      });
    }

    const { _id, createdHuntIds, createdLocationIds } = req.user;
    const { huntId, locationId, answerId } = req.params;
    console.log(huntId, locationId, answerId);
    console.log(_id, createdHuntIds, "createdLOcationIds", createdLocationIds);
    if (huntId) {
      // Check if user owns the hunt
      if (!createdHuntIds.includes(huntId)) {
        return res.status(403).json({
          status: "failed",
          message: "User does not own this hunt",
        });
      }
    } else if (locationId) {
      // Check if user owns the location
      if (!createdLocationIds.includes(locationId)) {
        return res.status(403).json({
          status: "failed",
          message: "User does not own this location",
        });
      }
    } else if (answerId) {
      // Check if user owns the answer
      const answer = await Answer.findById(answerId);
      if (!answer || answer.userId.toString() !== _id.toString()) {
        return res.status(403).json({
          status: "failed",
          message: "User does not own this answer",
        });
      }
    } else {
      // If none of the parameters are present
      return res.status(400).json({
        status: "failed",
        message: "No valid ID provided",
      });
    }
    next();
  } catch (err) {
    console.error('Error in VerifyOwnership middleware:', err);
    return res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
      data: [err.message],
    });
  }
}

