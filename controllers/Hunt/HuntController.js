import fs from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { poiDb, userDb } from '../../config/databaseConfig.js';
import { configManager } from '../GlobalSettingsModule/configManager.js';

// Directly deriving the directory path of the current module
const currentDir = dirname(fileURLToPath(import.meta.url));

// Adjusting the path to point to your `globalOptions.json` file
const configPath = join(currentDir, '../../config/globalOptions.json');

// Cache for the configuration
let cachedConfig = null;

// Ensure the configuration file exists and load it
async function initConfigFile() {
    try {
        await fs.access(configPath);
        const data = await fs.readFile(configPath, 'utf8');
        cachedConfig = JSON.parse(data);
    } catch (error) {
        cachedConfig = { startTime: null, endTime: null };
        await fs.writeFile(configPath, JSON.stringify(cachedConfig, null, 2), 'utf8');
    }
}

// Initialize the config file to ensure it exists and is loaded into cache
initConfigFile();

// Function to get the current globalOptions

export async function getHuntOptions(req, res) {
    try {
        await configManager.loadConfig(); // Ensure config is loaded
        const config = configManager.getConfig();
        const nrOfSignedUpUsers = await userDb.collection('user_infos').countDocuments();
        const nrOfObjectives = await poiDb.collection('locations').countDocuments();
        res.json({ ...config, nrOfSignedUpUsers, nrOfObjectives });
    } catch (error) {
        console.error('Failed to read the hunt options:', error);
        res.status(500).send('Error fetching hunt options');
    }
}


// Function to update the globalOptions
export async function updateHuntOptions(req, res) {
    try {
        const newOptions = req.body;
        await configManager.updateConfig(newOptions);
        res.json(configManager.getConfig());
    } catch (error) {
        console.error('Failed to update the hunt options:', error);
        res.status(500).send('Error updating hunt options');
    }
}

export async function getHuntStartStatus() {
    try {
        await configManager.loadConfig(); // Ensure config is loaded and up to date
        const config = configManager.getConfig();
        const startTime = new Date(config.startTime);
        const endTime = new Date(config.endTime);
        const currentTime = new Date();

        let status;
        if (currentTime < startTime) {
            status = "not_started";
        } else if (currentTime >= startTime && currentTime <= endTime) {
            status = "in_progress";
        } else if (currentTime > endTime) {
            status = "ended";
        }
        return status;
    } catch (err) {
        console.error('Failed to get the hunt status:', err);
        throw err;
    }
}
