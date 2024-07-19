import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SECRET_ACCES_TOKEN } from "../config/index.js";
import { userDb } from "../config/databaseConfig.js";
import { ObjectId } from "mongodb";

const UserSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: "Your firstname is required",
      max: 25,
    },
    last_name: {
      type: String,
      required: "Your lastname is required",
      max: 25,
    },
    email: {
      type: String,
      required: "Your email is required",
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: "Your password is required",
      select: false,
      max: 40,
    },
    town: {
      type: String,
      required: "Your town is required",
      max: 20,
    },
    role: {
      type: String,
      required: true,
      default: "0x01",
    },
    createdHuntIds: [
      {
        type: ObjectId,
        ref: "hunts",
      },
    ],
    createdLocationIds:[
      {
        type: ObjectId,
        ref: "locations",
      },
    ],
    currentHuntId: {
      type: ObjectId,
      ref: "hunts",
      default: null,
    },
    huntState: [
      {
        huntId: {
          type: ObjectId,
          ref: "hunts",
          required: true,
        },
        hasStartedHunt: {
          type: Boolean,
          default: false,
        },
        hasEndedHunt: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

UserSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.generateAccessJWT = function () {
  let payload = {
    id: this._id,
  };
  return jwt.sign(payload, SECRET_ACCES_TOKEN, {
    expiresIn: "240m",
  });
};

UserSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  const userId = this._id;

  // Update created hunts and locations
  await mongoose.model("hunts").updateMany(
    { author_id: userId },
    { $unset: { author_id: "" } }
  );

  await mongoose.model("locations").updateMany(
    { author_id: userId },
    { $unset: { author_id: "" } }
  );

  // Update current hunts and hunt states
  await mongoose.model("hunts").updateMany(
    { participating_user_ids: userId },
    { $pull: { participating_user_ids: userId } }
  );

  await mongoose.model("answers").updateMany(
    { userId },
    { $unset: { userId: "" } }
  );

  next();
});

export default userDb.model("user_infos", UserSchema);
