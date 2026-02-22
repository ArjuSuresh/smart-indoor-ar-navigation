const Crowd = require('../models/Crowd');
const graphService = require('./graph');

class CrowdManager {
    async updateCrowdDensity(nodeId, count) {
        let densityLevel = 'Low';
        if (count >= 4 && count <= 7) densityLevel = 'Medium';
        if (count >= 8) densityLevel = 'High';

        try {
            // Update or create crowd record in DB
            await Crowd.findOne({ nodeId, count, densityLevel }); // Check if changed

            // Update DB
            await Crowd.updateOne(
                { nodeId },
                { nodeId, count, densityLevel, lastUpdated: new Date() },
                { upsert: true }
            );

            // Update in-memory graph
            graphService.updateCrowdDensity(nodeId, densityLevel);

            return { nodeId, densityLevel };
        } catch (error) {
            console.error('Error updating crowd density:', error);
            throw error;
        }
    }

    async getCrowdStatus() {
        return await Crowd.find({});
    }
}

module.exports = new CrowdManager();
