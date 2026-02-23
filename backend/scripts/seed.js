const mongoose = require('mongoose');
const dotenv = require('dotenv');

// We need to require models, but the script is in scripts/ folder
// Assuming run from backend root via `npm run seed`
const Node = require('../models/Node');
const Edge = require('../models/Edge');
const Crowd = require('../models/Crowd');

dotenv.config({ path: '../.env' }); // Load env variables

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/ar-indoor-nav";

// Map based on SRI ABHINAVA VIDYATIRTHA BLOCK
const nodes = [
    // --- HALLWAYS (Walkable paths) ---
    { id: 'H1', name: 'Left Traverse 1', x: 35, y: 85 },
    { id: 'H2', name: 'Left Traverse 2', x: 35, y: 70 },
    { id: 'H3', name: 'Left Traverse 3', x: 35, y: 55 },
    { id: 'H4', name: 'Left Intersection', x: 35, y: 45 },
    { id: 'H5', name: 'Left Traverse 4', x: 35, y: 30 },
    { id: 'H6', name: 'Left Traverse 5', x: 35, y: 20 },
    { id: 'H7', name: 'Left Traverse 6', x: 35, y: 10 },

    { id: 'H8', name: 'Right Traverse 1', x: 75, y: 80 },
    { id: 'H9', name: 'Right Traverse 2', x: 75, y: 75 },
    { id: 'H10', name: 'Right Traverse 3', x: 75, y: 60 },
    { id: 'H11', name: 'Right Intersection', x: 75, y: 45 },
    { id: 'H12', name: 'Right Traverse 4', x: 75, y: 30 },
    { id: 'H13', name: 'Right Traverse 5', x: 75, y: 15 },

    { id: 'H14', name: 'Far Left Intersection', x: 15, y: 45 },

    // --- ROOMS & LOCATIONS ---
    // Left Block
    { id: 'n_therm', name: 'Thermal Engineering Lab II', x: 20, y: 85 },
    { id: 'n_mach', name: 'Machine Tools Lab II', x: 20, y: 70 },
    { id: 'n_mech_fac', name: 'Mech Faculty Room', x: 20, y: 55 },
    { id: 'n_gt', name: 'Girls Toilet', x: 10, y: 35 },
    { id: 'n_lstairs', name: 'Left Stairs', x: 25, y: 20, isExit: true, qrId: 'qr_left_stairs' },
    { id: 'n_mhod', name: 'Mech HOD', x: 25, y: 10 },

    // Middle Block
    { id: 'n_leca', name: 'Lecture Hall A', x: 55, y: 85 },
    { id: 'n_lecb', name: 'Lecture Hall B', x: 55, y: 70 },
    { id: 'n_fc', name: 'Faculty Center', x: 55, y: 30 },
    { id: 'n_rstairs', name: 'Right Stairs', x: 45, y: 20, isExit: true, qrId: 'qr_right_stairs' },
    { id: 'n_ahod', name: 'AI HOD', x: 45, y: 10 },

    // Right Block
    { id: 'n_bt1', name: 'Boys Toilet 1', x: 65, y: 75 },
    { id: 'n_bt2', name: 'Boys Toilet 2', x: 65, y: 30 },
    { id: 'n_lecc', name: 'Lecture Hall C', x: 90, y: 80, qrId: 'qr_lec_c' },
    { id: 'n_lecd', name: 'Lecture Hall D', x: 90, y: 60 },
    { id: 'n_stairs_p', name: 'Stairs (Right Block)', x: 90, y: 30, isExit: true, qrId: 'qr_main_stairs' },
    { id: 'n_facroom', name: 'Faculty Room', x: 90, y: 15 }
];

const edges = [
    // Hallway connections
    { sourceId: 'H1', targetId: 'H2', weight: 15 },
    { sourceId: 'H2', targetId: 'H3', weight: 15 },
    { sourceId: 'H3', targetId: 'H4', weight: 10 },
    { sourceId: 'H4', targetId: 'H5', weight: 15 },
    { sourceId: 'H5', targetId: 'H6', weight: 10 },
    { sourceId: 'H6', targetId: 'H7', weight: 10 },

    { sourceId: 'H8', targetId: 'H9', weight: 5 },
    { sourceId: 'H9', targetId: 'H10', weight: 15 },
    { sourceId: 'H10', targetId: 'H11', weight: 15 },
    { sourceId: 'H11', targetId: 'H12', weight: 15 },
    { sourceId: 'H12', targetId: 'H13', weight: 15 },

    { sourceId: 'H14', targetId: 'H4', weight: 20 },
    { sourceId: 'H4', targetId: 'H11', weight: 40 },

    // Connect Rooms to closest Hallway node
    { sourceId: 'n_therm', targetId: 'H1', weight: 15 },
    { sourceId: 'n_mach', targetId: 'H2', weight: 15 },
    { sourceId: 'n_mech_fac', targetId: 'H3', weight: 15 },
    { sourceId: 'n_gt', targetId: 'H14', weight: 15 },
    { sourceId: 'n_lstairs', targetId: 'H6', weight: 10 },
    { sourceId: 'n_mhod', targetId: 'H7', weight: 10 },

    { sourceId: 'n_leca', targetId: 'H1', weight: 20 },
    { sourceId: 'n_lecb', targetId: 'H2', weight: 20 },
    { sourceId: 'n_fc', targetId: 'H5', weight: 20 },
    { sourceId: 'n_rstairs', targetId: 'H6', weight: 10 },
    { sourceId: 'n_ahod', targetId: 'H7', weight: 10 },

    { sourceId: 'n_bt1', targetId: 'H9', weight: 10 },
    { sourceId: 'n_bt2', targetId: 'H12', weight: 10 },
    { sourceId: 'n_lecc', targetId: 'H8', weight: 15 },
    { sourceId: 'n_lecd', targetId: 'H10', weight: 15 },
    { sourceId: 'n_stairs_p', targetId: 'H12', weight: 15 },
    { sourceId: 'n_facroom', targetId: 'H13', weight: 15 },
];

async function seed() {
    try {
        console.log('Connecting to MongoDB via:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB. Clearing old nodes & edges...');

        await Node.deleteMany({});
        await Edge.deleteMany({});
        await Crowd.deleteMany({});

        console.log('Inserting new Map Nodes...');
        await Node.insertMany(nodes);

        console.log('Inserting new Map Edges...');
        const finalEdges = [];
        edges.forEach(e => {
            finalEdges.push(e);
            finalEdges.push({ sourceId: e.targetId, targetId: e.sourceId, weight: e.weight });
        });

        await Edge.insertMany(finalEdges);

        console.log('Map Seeding complete for SRI ABHINAVA VIDYATIRTHA BLOCK!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

seed();
