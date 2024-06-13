import { huntDb, poiDb, userDb } from '../../config/databaseConfig.js';
import { ObjectId } from "mongodb";

// Function to get the current hunt options by hunt ID
export async function getHuntOptionsById(req, res) {
    const { huntId } = req.params;
    try {
        const hunt = await huntDb.collection('hunts').findOne({ _id: new ObjectId(huntId) });
        if (!hunt) {
            return res.status(404).send('Hunt not found');
        }

        const nrOfSignedUpUsers = await userDb.collection('user_infos').countDocuments({ currentHuntId: new ObjectId(huntId) });
        const nrOfObjectives = await poiDb.collection('locations').countDocuments({ hunts: new ObjectId(huntId) });
        
        res.json({ ...hunt, nrOfSignedUpUsers, nrOfObjectives });
    } catch (error) {
        console.error('Failed to read the hunt options:', error);
        res.status(500).send('Error fetching hunt options');
    }
}

// Function to update the hunt options by hunt ID
export async function updateHuntOptionsById(req, res) {
    const { huntId } = req.params;
    const newOptions = req.body;

    try {
        const updateResult = await huntDb.collection('hunts').updateOne(
            { _id: new ObjectId(huntId) },
            { $set: newOptions }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).send('Hunt not found');
        }

        const updatedHunt = await huntDb.collection('hunts').findOne({ _id: new ObjectId(huntId) });
        res.json(updatedHunt);
    } catch (error) {
        console.error('Failed to update the hunt options:', error);
        res.status(500).send('Error updating hunt options');
    }
}

// Function to get the start status of a hunt by hunt ID
export async function getHuntStatusById(req, res) {
    const { huntId } = req.params;

    try {
        const hunt = await huntDb.collection('hunts').findOne({ _id: new ObjectId(huntId) });
        if (!hunt) {
            return res.status(404).send('Hunt not found');
        }

        const startTime = new Date(hunt.startTime);
        const endTime = new Date(hunt.endTime);
        const currentTime = new Date();

        let status;
        if (currentTime < startTime) {
            status = "not_started";
        } else if (currentTime >= startTime && currentTime <= endTime) {
            status = "in_progress";
        } else if (currentTime > endTime) {
            status = "ended";
        }
        res.json({ status });
    } catch (error) {
        console.error('Failed to get the hunt status:', error);
        res.status(500).send('Error fetching hunt status');
    }
}
