const express = require('express');
const router = express.Router();
const Node = require('../models/Node');

// GET /api/qr/:id
// Returns the node associated with the QR code
router.get('/:id', async (req, res) => {
    try {
        const qrId = req.params.id;
        const node = await Node.findOne({ qrId });

        if (!node) {
            return res.status(404).json({ error: 'QR Code not found' });
        }

        res.json({
            nodeId: node.id,
            position: { x: node.x, y: node.y, floor: node.floor },
            message: `You are at ${node.name || 'Location ' + node.id}`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
