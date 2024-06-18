import { huntDb, poiDb, userDb } from "../../config/databaseConfig.js";
import { ObjectId } from "mongodb";
import Hunt from "../../models/Hunt.js";
import User from "../../models/User.js";

// Function to get the current hunt options by hunt ID
export async function getHuntOptionsById(req, res) {
  const { huntId } = req.params;
  try {
    const hunt = await huntDb
      .collection("hunts")
      .findOne({ _id: new ObjectId(huntId) });
    if (!hunt) {
      return res.status(404).json({
        status: "error",
        message: "Hunt not found",
      });
    }

    const nrOfSignedUpUsers = await userDb
      .collection("user_infos")
      .countDocuments({ currentHuntId: new ObjectId(huntId) });
    const nrOfObjectives = await poiDb
      .collection("locations")
      .countDocuments({ hunts: new ObjectId(huntId) });

    res.json({ ...hunt, nrOfSignedUpUsers, nrOfObjectives });
  } catch (error) {
    console.error("Failed to read the hunt options:", error);
    res.status(500).json({
      status: "error",
      data: [error],
      message: "Internal Server Error",
    });
  }
}

// Function to update the hunt options by hunt ID
export async function updateHuntOptionsById(req, res) {
  const { huntId } = req.params;
  const newOptions = req.body;

  try {
    const updateResult = await huntDb
      .collection("hunts")
      .updateOne({ _id: new ObjectId(huntId) }, { $set: newOptions });

    if (updateResult.matchedCount === 0) {
      return res.status(404).send("Hunt not found");
    }

    const updatedHunt = await huntDb
      .collection("hunts")
      .findOne({ _id: new ObjectId(huntId) });
    res.json(updatedHunt);
  } catch (error) {
    console.error("Failed to update the hunt options:", error);
    res.status(500).send("Error updating hunt options");
  }
}

// Function to get the start status of a hunt by hunt ID
export async function getHuntStatusById(req, res) {
  try {
    const { huntId } = req.params;
    const hunt = await huntDb
      .collection("hunts")
      .findOne({ _id: new ObjectId(huntId) });
    if (!hunt) {
      return res.status(404).send("Hunt not found");
    }
    const startTime = new Date(hunt.startTime);
    const endTime = new Date(hunt.endTime);
    const currentTime = new Date();

    let huntStatus;
    if (currentTime < startTime) {
      huntStatus = "not_started";
    } else if (currentTime >= startTime && currentTime <= endTime) {
      huntStatus = "in_progress";
    } else if (currentTime > endTime) {
      huntStatus = "ended";
    }
    return res.status(200).json({
      status: "success",
      data: huntStatus,
      message: "Hunt status fetched successfully",
    });
  } catch (error) {
    console.error("Failed to get the hunt status:", error);
    return res.status(500).json({
      status: "error",
      data: [error],
      message: "Internal Server Error",
    });
  }
}

//Retrieve all the hunts from the databese (id,... all info), in an array : hunts[]
export async function getAllHunts(req, res) {
  try {
    const hunts = await huntDb.collection("hunts").find().toArray();
    res.json({
      status: "success",
      data: hunts,
      message: "Hunts fetched successfully!",
    });
  } catch (error) {
    console.error("Failed to get the hunts:", error);
    res.status(500).json({
      status: "error",
      data: [error],
      message: "Internal Server Error",
    });
  }
}

//Create new hunt object

export async function createHunt(req, res) {
  try {
    const { huntName, townName, startTime, endTime } = req.body;
    ///Create new hunt object from deconstructed JSON
    const newHunt = new Hunt({
      huntName,
      townName,
      startTime,
      endTime,
    });

    ///Insert new hunt object in the database, if the name is not already in the database
    const hunts = await huntDb.collection("hunts").find({ huntName }).toArray();
    if (hunts.length > 0) {
      return res.status(400).json({
        status: "failed",
        message: "A hunt with that name already exists!",
      });
    }
    const insertResult = await huntDb.collection("hunts").insertOne(newHunt);
    const hunt = await huntDb
      .collection("hunts")
      .findOne({ _id: insertResult.insertedId });
    res.json({
      status: "success",
      data: hunt,
      message: "Hunt created successfully!",
    });
  } catch (error) {
    console.error("Failed to create the hunt:", error);
    res.status(500).json({
      status: "error",
      data: [error],
      message: "Internal Server Error",
    });
  }
}

///Set user's active hunt to a specific id
export async function joinHuntById(req, res) {
  const { huntId } = req.params;
  const { _id: userId } = req.user;
  try {
    const hunt = await Hunt.findById(huntId);
    if (!hunt) {
      return res.status(404).json({
        status: "error",
        message: "Hunt not found",
      });
    }

    let userUpdateQuery = { _id: userId };
    let userUpdateData = { currentHuntId: huntId };
    let userUpdateOptions = { new: true };
    if (req.user.currentHuntId) {
      // Set the hasEndedHunt to true in the old hunt's state
      userUpdateData["huntState.$[elem].hasEndedHunt"] = true;
      userUpdateOptions["arrayFilters"] = [
        { "elem.huntId": req.user.currentHuntId },
      ];

      // Remove user from the old hunt's participating users
      await Hunt.updateOne(
        { _id: req.user.currentHuntId },
        { $pull: { participating_user_ids: userId } }
      );
    }

    // Update user's current hunt and huntState
    await User.updateOne(
      userUpdateQuery,
      { $set: userUpdateData },
      userUpdateOptions
    );

    // Ensure the huntState array is updated for the new hunt
    const huntStateIndex = req.user.huntState.findIndex(
      (state) => state.huntId.toString() === huntId
    );
    if (huntStateIndex > -1) {
      await User.updateOne(
        { _id: userId, "huntState.huntId": huntId },
        {
          $set: {
            "huntState.$.hasStartedHunt": true,
            "huntState.$.hasEndedHunt": true,
          },
        }
      );
    } else {
      await User.updateOne(
        { _id: userId },
        {
          $push: {
            huntState: {
              huntId: huntId,
              hasStartedHunt: false,
              hasEndedHunt: false,
            },
          },
        }
      );
    }

    // Add user to new hunt's participating users
    await Hunt.updateOne(
      { _id: huntId },
      { $addToSet: { participating_user_ids: userId } }
    );

    res.status(200).json({
      status: "success",
      message: "Hunt joined successfully!",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      data: [error],
      message: "Internal Server Error",
    });
  }
}

export async function getHuntLocationsById(req, res) {
  try {
    const { huntId } = req.params;
    const { _id: userId } = req.user;


    const locations = await Location.find({ hunts: huntId });
    res.json({
      status: "success",
      data: locations,
      message: "Hunt locations retrieved successfully!",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "error",
      data: [err],
      message: "Internal Server Error",
    });
  }
}
