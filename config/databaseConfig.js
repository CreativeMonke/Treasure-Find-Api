// databaseConfig.js

import mongoose from 'mongoose';
import { URI_USER, URI_POI , URI_RESPONSES} from "./index.js";

// Initialize mongoose connections for both databases
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

// User database connection
const userDb = mongoose.createConnection(URI_USER, options);

userDb.on('connected', () => console.log('Connected to USER database'));
userDb.on('error', (err) => console.error(`Error connecting to USER database: ${err.message}`));

// POI database connection
const poiDb = mongoose.createConnection(URI_POI, options);

poiDb.on('connected', () => console.log('Connected to POI database'));
poiDb.on('error', (err) => console.error(`Error connecting to POI database: ${err.message}`));


//Responses database connection

const responsesDb = mongoose.createConnection(URI_RESPONSES, options);

responsesDb.on('connected', () => console.log('Connected to RESPONSES database'));
responsesDb.on('error', (err) => console.error(`Error connecting to RESPONSES database: ${err.message}`));
export { userDb, poiDb , responsesDb } ;
