import * as dotenv from "dotenv";
dotenv.config();

const { URI_USER, URI_POI, URI_RESPONSES, PORT, SECRET_ACCES_TOKEN, HUGGING_FACE_TOKEN} = process.env;
export { URI_USER, URI_POI, URI_RESPONSES, PORT, SECRET_ACCES_TOKEN , HUGGING_FACE_TOKEN };