import express from "express"; // import the express module
import Auth from "./auth.js";
import User from "./user.js";
import Hunt from "./hunt.js";
import { Verify, VerifyRole } from "../middleware/verify.js";
import { Logout } from "../controllers/auth.js";
import locationRoutes from "./locationsRoutes.js";
import Answers from "./answers.js";
import GeneralRoutes from "./general.js";
const app = express();
app.use("/auth", Auth);
app.use("/answer", Answers);
app.use("/users", User);
app.use("/hunt", Hunt);
app.use("/general", GeneralRoutes);
app.get("/", (req, res) => {
  try {
    res.status(200).json({
      status: "success",
      data: [],
      message: "Welcome to our API homepage!",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      data: [err],
      message: "Internal Server Error",
    });
  }
});
app.get("/user", Verify, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to your hunt!",
  });
});

app.get("/admin", Verify, VerifyRole, (req, res) => {
  res.status(200).json({
    status: "succes",
    message: "Welcome to the Admin portal!",
  });
});
app.get("/logout", Logout);
app.use(locationRoutes);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

export default app;
