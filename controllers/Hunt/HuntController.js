import fs from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { poiDb, userDb } from '../../config/databaseConfig.js';

// Directly deriving the directory path of the current module
const currentDir = dirname(fileURLToPath(import.meta.url));

// Adjusting the path to point to your `globalOptions.json` file
const configPath = join(currentDir, '../../config/globalOptions.json');

// Ensure the configuration file exists. Initialize it with default values if it doesn't.
async function initConfigFile() {
    try {
        await fs.access(configPath);
    } catch (error) {
        const defaultConfig = { startTime: null, endTime: null };
        await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2), 'utf8');
    }
}

// Initialize the config file to ensure it exists
initConfigFile();

// Function to get the current globalOptions

export async function getHuntOptions(req, res) {
    try {
        let data = await fs.readFile(configPath, 'utf8');
        data = JSON.parse(data);
        const nrOfSignedUpUsers = await userDb.collection('user_infos').countDocuments();
        const nrOfObjectives = await poiDb.collection('locations').countDocuments();
        res.json({ startTime: data.startTime, endTime: data.endTime, nrOfSignedUpUsers, nrOfObjectives });
        res.nrOfUsers = userDb.collection('user_infos').countDocuments();
    } catch (error) {
        console.error('Failed to read the hunt options:', error);
        res.status(500).send('Error fetching hunt options');
    }
}

// Function to update the globalOptions
export async function updateHuntOptions(req, res) {
    try {
        const newOptions = req.body;
        const data = await fs.readFile(configPath, 'utf8');
        const currentOptions = JSON.parse(data);
        const updatedOptions = { ...currentOptions, ...newOptions };
        await fs.writeFile(configPath, JSON.stringify(updatedOptions, null, 2), 'utf8');
        res.json(updatedOptions);
    } catch (error) {
        console.error('Failed to update the hunt options:', error);
        res.status(500).send('Error updating hunt options');
    }
}
