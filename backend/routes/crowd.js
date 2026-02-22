const express = require('express');
const router = express.Router();
const crowdManager = require('../services/crowdManager');

// POST /api/crowd/update
// Body: { nodeId, count }
router.post('/update', async (req, res) => {
    try {
        const { nodeId, count } = req.body;
        if (!nodeId || count == null) {
            return res.status(400).json({ error: 'Missing nodeId or count' });
        }

        const updated = await crowdManager.updateCrowdDensity(nodeId, count);
        res.json({ message: 'Crowd density updated', data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/crowd/status
router.get('/status', async (req, res) => {
    try {
        const status = await crowdManager.getCrowdStatus();
        res.json(status);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
