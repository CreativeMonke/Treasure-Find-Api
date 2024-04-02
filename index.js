import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT } from "./config/index.js";
import App from "./routes/app.js";


const server = express();
const corsOptions = {
    origin: 'https://treasure-find.vercel.app', // Update to your front-end app's domain
    credentials: true, // Allow credentials (cookies, authentication tokens) to be sent
};

server.use(cors(corsOptions));

server.disable("x-powered-by");
server.use(cookieParser());
server.use(express.urlencoded({ extended: false }));
server.use(express.json());

// You might not need to explicitly handle connection events here since it's done in databaseConfig.js
// But you can still use userDb and poiDb in your models or wherever necessary

server.use(App);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
