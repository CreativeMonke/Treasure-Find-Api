import { Login, Register , checkLogin } from "../controllers/auth.js";
import Validate from "../middleware/validate.js";
import { check, validationResult } from "express-validator";
import express from "express";
import { Verify } from "../middleware/verify.js";
import { updateUser } from "../controllers/updateUser.js";
import { validateUpdate } from "../middleware/update.js";
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
  check("towm").notEmpty().withMessage("Town required!"),
  Validate,
  Register
);

router.get('/checkLoggedIn',Validate,checkLogin);
router.post(
  "/login",
  check("email").isEmail().withMessage("Enter a valid email address").normalizeEmail(),
  check("password").not().isEmpty(),
  Validate,
  Login,
);
router.put(
  "/user/edit",
  check('first_name')
      .optional()
      .trim()
      .escape()
      .isLength({ min: 2, max: 25 })
      .withMessage('Your first name must be between 2 and 25 characters.'),
    check('last_name')
      .optional()
      .trim()
      .escape()
      .isLength({ min: 2, max: 25 })
      .withMessage('Your last name must be between 2 and 25 characters.'),
    check('town')
      .optional()
      .trim()
      .escape()
      .isLength({ min: 2, max: 20 })
      .withMessage('Your town must be between 2 and 20 characters.'),
  Verify,
  validateUpdate,
  updateUser,
)
export default router;
