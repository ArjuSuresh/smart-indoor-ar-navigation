const express = require('express');
const router = express.Router();
const astarService = require('../services/astar');
const graphService = require('../services/graph');
const Node = require('../models/Node');

// Middleware to ensure graph is initialized
router.use((req, res, next) => {
    if (!graphService.isInitialized) {
        graphService.initialize()
            .then(() => next())
            .catch(err => res.status(500).json({ error: 'Failed to initialize navigation graph', details: err.message }));
    } else {
        next();
    }
});

// POST /api/navigate
// Body: { startNodeId, endNodeId, qrId, isEmergency }
router.post('/', async (req, res) => {
    try {
        const { startNodeId, endNodeId, qrId, isEmergency } = req.body;

        let startId = startNodeId;

        // Resolve start node from QR if not provided
        if (!startId && qrId) {
            const startNode = await Node.findOne({ qrId });
            if (startNode) startId = startNode.id;
        }

        // Emergency Mode: Navigate to nearest Exit
        if (isEmergency) {
            if (!startId) {
                return res.status(400).json({ error: 'Start location required for emergency navigation' });
            }

            const path = astarService.findNearestExit(startId);
            if (!path) {
                return res.status(404).json({ error: 'No exit found reachable from current location' });
            }
            return res.json({ path, mode: 'emergency' });
        }

        // Normal Navigation
        if (!endNodeId) {
            return res.status(400).json({ error: 'Destination (endNodeId) required for navigation' });
        }

        // Entrance Selection Logic: If no start node provided, find optimal entrance
        if (!startId) {
            const entrances = await Node.find({ isEntrance: true });
            if (entrances.length === 0) {
                return res.status(400).json({ error: 'No start location provided and no public entrances found' });
            }

            let bestPath = null;
            let minCost = Infinity;

            for (const entrance of entrances) {
                const path = astarService.findPath(entrance.id, endNodeId);
                if (path) {
                    // Calculate total cost (heuristic isn't total cost, need actual G score or path length)
                    // A* returns nodes. Let's calculate cost by summing edge weights.
                    // Or modify A* to return { path, cost }.
                    // For now, re-calculate cost roughly or assume path.length is proxy? No, weights matter.

                    let currentCost = 0;
                    for (let i = 0; i < path.length - 1; i++) {
                        // We need weight between path[i] and path[i+1]
                        const neighbors = graphService.getNeighbors(path[i].id);
                        const edge = neighbors.find(n => n.id === path[i + 1].id);
                        if (edge) currentCost += edge.weight;
                    }

                    if (currentCost < minCost) {
                        minCost = currentCost;
                        bestPath = path;
                    }
                }
            }

            if (bestPath) {
                return res.json({ path: bestPath, mode: 'optimal-entrance' });
            } else {
                return res.status(404).json({ error: 'No path found from any entrance' });
            }
        }

        // Standard Point-to-Point Navigation
        const path = astarService.findPath(startId, endNodeId);
        if (!path) {
            return res.status(404).json({ error: 'No path found' });
        }

        res.json({ path, mode: 'normal' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
