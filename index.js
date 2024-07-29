import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT } from "./config/index.js";
import App from "./routes/app.js";


const server = express();
const corsOptions = {
    origin: ['https://treasure-find.vercel.app','https://localhost:3000'],
    credentials: true,
};

server.use(cors(corsOptions));
server.disable("x-powered-by");
server.use(cookieParser());
server.use(express.urlencoded({ extended: false }));
server.use(express.json());
server.use(App);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
