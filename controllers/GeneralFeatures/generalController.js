import { ObjectId } from "mongodb";
import Hunt from "../../models/Hunt.js";
import User from "../../models/User.js";
import Location from "../../models/Location.js";
import TempChange from "../../models/TempChange.js";
import bcrypt from "bcrypt";

export async function getPreviewData(req, res) {
  ///Return nr of Hunts, Locations, and Users
  try {
    const nrOfHunts = await Hunt.countDocuments();
    const nrOfLocations = await Location.countDocuments();
    const nrOfSignedUpUsers = await User.countDocuments();

    res.status(200).json({
      status: "success",
      data: {
        nrOfHunts: nrOfHunts,
        nrOfLocations: nrOfLocations,
        nrOfSignedUpUsers: nrOfSignedUpUsers,
      },
      message: "Preview data retrieved successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      data: [err],
      message: "Failed to retrieve preview data",
    });
  }
}

export async function verifyCode(req, res) {
  const { verificationCode, change, type } = req.body;
  try {
    if (!verificationCode || !change || !type) {
      return res.status(400).json({
        status: "failed",
        message: "Missing required fields",
      });
    }
    const tempChange = await TempChange.findOne({ change, type });
    if (tempChange.verificationCode === verificationCode) {
      tempChange.deleteOne();
      return res.status(200).json({
        status: "success",
        data: tempChange,
        message: "Code verified successfully",
      });
    } else {
      return res.status(202).json({
        status: "failed",
        message: "Invalid verification code",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      data: [err],
      message: "Failed to verify code",
    });
  }
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  try {
    const { _id: userId } = req.user;

    const user = await User.findById(userId).select("+password");
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid)
      return res.status(207).json({
        status: "failed",
        message: "Invalid password",
      });

    user.password = newPassword;
    const savedUser = await user.save();
    savedUser.password = undefined;
    res.status(200).json({
      status: "success",
      data: savedUser,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      data: [err],
      message: "Internal Server Error",
    });
  }
}

export async function resetPassword(req, res) {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });

    user.password = newPassword;
    const savedUser = await user.save();
    savedUser.password = undefined;
    res.status(200).json({
      status: "success",
      data: savedUser,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      data: [err],
      message: "Internal Server Error",
    });
  }
}
