import User from "../models/User.js";

export async function updateUser(req, res) {
  try {
    const userId = req.user._id;
    const updates = req.body;

    const allowedUpdates = [
      "first_name",
      "last_name",
      "town",
      "currentHuntId",
      "huntState",
    ];
    const actualUpdates = Object.keys(updates).filter((key) =>
      allowedUpdates.includes(key)
    );

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found!",
      });
    }

    actualUpdates.forEach((update) => {
      if (user[update] !== undefined) {
        // Ensure the update property exists on the user
        user[update] = updates[update];
      } else {
        throw new Error(`Attempt to update non-existing property: ${update}`);
      }
    });

    await user.save();

    const { password, ...updatedUserData } = user._doc;
    res.status(200).json({
      status: "success",
      data: updatedUserData,
      message: "User data changed successfully!",
    });
  } catch (err) {
    console.error("Error updating user:", err.message);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
  res.end();
}

export async function startHunt(req, res) {
  try {
    const user = await User.findById(req.user._id);
    const huntId = user.currentHuntId;

    const huntIndex = user.huntState.findIndex(
      (hunt) => hunt.huntId.toString() === huntId.toString()
    );
    if (huntIndex !== -1) {
      user.huntState[huntIndex].hasStartedHunt = true;
      user.huntState[huntIndex].hasEndedHunt = false;
    } else {
      user.huntState.push({
        huntId,
        hasStartedHunt: true,
        hasEndedHunt: false,
      });
    }

    await user.save();
    res.status(200).json({
      status: "success",
      message: "Hunt started successfully!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
}

export async function endHunt(req, res) {
  try {
    const user = await User.findById(req.user._id);
    const huntId = user.currentHuntId;

    const huntIndex = user.huntState.findIndex(
      (hunt) => hunt.huntId.toString() === huntId.toString()
    );
    if (huntIndex !== -1) {
      user.huntState[huntIndex].hasEndedHunt = true;
    } else {
      user.huntState.push({
        huntId,
        hasStartedHunt: false,
        hasEndedHunt: true,
      });
    }

    await user.save();
    res.status(200).json({
      status: "success",
      message: "Hunt ended!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
}
export async function editUserById(req, res, { aditionalUpdates = [] }) {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const allowedUpdates = [
      "first_name",
      "last_name",
      "email",
      "town",
      "password",
      ...aditionalUpdates,
    ];

    const actualUpdates = Object.keys(updates).filter((key) =>
      allowedUpdates.includes(key)
    );
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "failed",
        message: "User not found!",
      });
    }
    actualUpdates.forEach((update) => {
      user[update] = updates[update];
    });
    await user.save();
    const { password, ...updatedUserData } = user._doc;
    res.status(200).json({
      status: "success",
      data: updatedUserData,
      message: "User data changed successfully!",
    });
  } catch (evt) {
    console.error(evt);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await User.find();
    const usersData = users.map(({ _doc }) => {
      const { password, ...userData } = _doc;
      return userData;
    });
    res.status(200).json({
      status: "success",
      data: usersData,
      message: "Users fetched successfully!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
  res.end();
}
