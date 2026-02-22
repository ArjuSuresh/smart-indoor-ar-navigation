const mongoose = require('mongoose');

const CrowdSchema = new mongoose.Schema({
    nodeId: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    densityLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low'
    },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Crowd', CrowdSchema);
