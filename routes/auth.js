import { Login, Register, checkLogin, Logout, VerifyEmail } from "../controllers/auth.js";
import Validate from "../middleware/validate.js";
import { check } from "express-validator";
import express from "express";
import { Verify } from "../middleware/verify.js";

const router = express.Router();

router.post(
  "/register",
  check("email")
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),
  check("first_name")
    .not()
    .isEmpty()
    .withMessage("Your first name is required")
    .trim()
    .escape(),
  check("last_name")
    .not()
    .isEmpty()
    .withMessage("You last name is required")
    .trim()
    .escape(),
  check("password")
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 chars long"),
  check("town").notEmpty().withMessage("Town required!"),
  Validate,
  Register
);
router.post("/verifyEmail",
  check("email")
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),
  Validate,
  VerifyEmail);
router.get('/checkLoggedIn', Verify, checkLogin);
router.post(
  "/login",
  check("email")
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),
  check("password")
    .not()
    .isEmpty(),
  Validate,
  Login,
);
router.get("/logout", Verify, Logout);

export default router;
