const mongoose = require('mongoose');
const dotenv = require('dotenv');

// We need to require models, but the script is in scripts/ folder
// Assuming run from backend root via `npm run seed`
const Node = require('../models/Node');
const Edge = require('../models/Edge');
const Crowd = require('../models/Crowd');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ar-indoor-nav';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(async () => {
        console.log('Connected to DB. Seeding...');

        await Node.deleteMany({});
        await Edge.deleteMany({});
        await Crowd.deleteMany({});

        const nodes = [
            { id: 'entry1', x: 0, y: 0, floor: 1, isEntrance: true, name: 'Main Entrance' },
            { id: 'hallway1', x: 10, y: 0, floor: 1, name: 'Hallway Start' },
            { id: 'hallway2', x: 20, y: 0, floor: 1, name: 'Hallway Mid' },
            { id: 'shopA', x: 20, y: 5, floor: 1, name: 'Coffee Shop', qrId: 'qr-coffee' },
            { id: 'exit1', x: 30, y: 0, floor: 1, isExit: true, name: 'Emergency Exit' },
            { id: 'stairs', x: 20, y: -5, floor: 1, name: 'Stairs to F2' }
        ];

        const edges = [
            { sourceId: 'entry1', targetId: 'hallway1', weight: 10 },
            { sourceId: 'hallway1', targetId: 'hallway2', weight: 10 },
            { sourceId: 'hallway2', targetId: 'shopA', weight: 5 },
            { sourceId: 'hallway2', targetId: 'exit1', weight: 10 },
            { sourceId: 'hallway2', targetId: 'stairs', weight: 5 }
        ];

        // Add reverse edges for undirected movement
        const reverseEdges = edges.map(e => ({
            sourceId: e.targetId,
            targetId: e.sourceId,
            weight: e.weight
        }));

        try {
            await Node.insertMany(nodes);
            await Edge.insertMany([...edges, ...reverseEdges]);
            console.log('Seeding complete.');
            process.exit(0);
        } catch (err) {
            console.error('Error inserting data:', err);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
