import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import {PORT, URI} from "./config/index.js";
import App from "./routes/app.js";

const server = express();

server.use(cors());

server.disable("x-powered-by");
server.use(cookieParser());
server.use(express.urlencoded({extended: false}));
server.use(express.json());

mongoose.promise = global.promise;
mongoose.set("strictQuery" , false);
mongoose.connect(URI , {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(console.log("Connected to database!")).catch((err) => console.log(err));

server.use(App);

server.listen(PORT , () => console.log(`Server running on port ${PORT}`));