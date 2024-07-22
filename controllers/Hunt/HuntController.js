import { huntDb, poiDb, userDb } from "../../config/databaseConfig.js";
import { ObjectId } from "mongodb";
import Hunt from "../../models/Hunt.js";
import User from "../../models/User.js";
import Location from "../../models/Location.js";

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
  const { location_ids } = newOptions;

  try {
    // Retrieve the current hunt options from the database
    const hunt = await Hunt.findById(huntId);
    if (!hunt) {
      return res.status(404).json({
        status: "failed",
        message: "Hunt not found",
      });
    }

    // Merge the new options with the current options
    const updatedOptions = {
      ...hunt.toObject(), // Convert the mongoose document to a plain object
      ...newOptions,
    };

    // Update the hunt options in the database
    await Hunt.findByIdAndUpdate(huntId, updatedOptions, { new: true });

    // Update the locations to reflect which hunt they belong to
    if (location_ids) {
      // Clear existing hunt references from locations
      await Location.updateMany(
        { hunts: huntId },
        { $pull: { hunts: huntId } }
      );

      // Add the hunt reference to the new locations
      await Location.updateMany(
        { _id: { $in: location_ids } },
        { $addToSet: { hunts: huntId } }
      );
    }

    res.status(200).json({
      status: "success",
      data: updatedOptions,
      message: "Hunt options updated successfully",
    });
  } catch (error) {
    console.error("Failed to update the hunt options:", error);
    res.status(500).json({
      status: "failed",
      message: "Error updating hunt options",
      data: [error.message],
    });
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
    const {
      huntName,
      townName,
      startTime,
      endTime,
      areAnswersReady,
      location_ids,
    } = req.body;
    const { _id: userId } = req.user;
    ///Create new hunt object from deconstructed JSON, then add "author_id" from userId
    const newHunt = new Hunt({
      huntName,
      townName,
      startTime,
      endTime,
      areAnswersReady,
      location_ids,
      author_id: userId,
    });
    console.log(newHunt);
    ///Insert new hunt object in the database, if the name is not already in the database
    const hunts = await huntDb.collection("hunts").find({ huntName }).toArray();
    if (hunts.length > 0) {
      return res.status(400).json({
        status: "failed",
        message: "A hunt with that name already exists!",
      });
    } else {
      const insertResult = await huntDb.collection("hunts").insertOne(newHunt);
      const hunt = await huntDb
        .collection("hunts")
        .findOne({ _id: insertResult.insertedId });
      ///Add the huntId to the createdHuntIds in the user

      await userDb
        .collection("user_infos")
        .updateOne(
          { _id: new ObjectId(userId) },
          { $push: { createdHuntIds: new ObjectId(insertResult.insertedId) } }
        );

      ///Add the huntId to the locations
      if (location_ids) {
        await Location.updateMany(
          { _id: { $in: location_ids } },
          { $addToSet: { hunts: hunt._id } }
        );
      }

      res.status(201).json({
        status: "success",
        data: hunt,
        message: "Hunt created successfully!",
      });
    }
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
    if (req.user.currentHuntId) {
      await Hunt.updateOne(
        { _id: req.user.currentHuntId },
        { $pull: { participating_user_ids: userId } }
      );
    }

    await User.updateOne(userUpdateQuery, { $set: userUpdateData });

    const huntStateIndex = req.user.huntState.findIndex(
      (state) => state.huntId.toString() === huntId
    );
    if (huntStateIndex === -1) {
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
    await Hunt.updateOne(
      { _id: huntId },
      { $addToSet: { participating_user_ids: userId } }
    );

    res.status(200).json({
      status: "success",
      data: hunt,
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

export async function deleteHuntById(req, res) {
  const { huntId } = req.params;

  try {
    await Hunt.deleteOne({ _id: huntId });

    res.status(200).json({
      status: "success",
      message: "Hunt deleted successfully!",
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

export async function getCurrentHuntByUserId(req, res) {
  const { currentHuntId } = req.user;
  if (!currentHuntId) {
    return res.status(200).json({
      status: "success",
      data: [],
      message: "User hasn't joined a hunt!",
    });
  }
  ///Get hunt by currentHuntId
  const hunt = await Hunt.findById(currentHuntId);
  if (!hunt) {
    return res.status(404).json({
      status: "error",
      message: "Hunt not found",
    });
  }
  res.status(200).json({
    status: "success",
    data: hunt,
    message: "Hunt fetched successfully!",
  });
}

export async function exitHuntByUserHuntId(req, res) {
  const { _id: userId } = req.user;
  const { currentHuntId } = req.user;
  console.log(req.user);
  try {
    if (!currentHuntId) {
      return res.status(200).json({
        status: "success",
        message: "User hasn't joined a hunt!",
      });
    }
    await User.updateOne({ _id: userId }, { $set: { currentHuntId: null } });
    await Hunt.updateOne(
      { _id: currentHuntId },
      { $pull: { participating_user_ids: userId } }
    );

    res.status(200).json({
      status: "success",
      message: "User exited the hunt successfully!",
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

export async function exitHuntByHuntId(req, res) {
  const { huntId } = req.params;
  const { _id: userId } = req.user;
  try {
    await Hunt.updateOne(
      { _id: huntId },
      { $pull: { participating_user_ids: userId } }
    );
    await User.updateOne({ _id: userId }, { $set: { currentHuntId: null } });

    res.status(200).json({
      status: "success",

      message: "User exited the hunt successfully!",
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
