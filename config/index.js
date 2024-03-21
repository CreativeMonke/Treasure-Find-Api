import * as dotenv from "dotenv";
dotenv.config();

const {URI,PORT,SECRET_ACCES_TOKEN} = process.env;
export {URI,PORT,SECRET_ACCES_TOKEN};