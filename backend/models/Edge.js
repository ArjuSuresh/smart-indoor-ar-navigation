const mongoose = require('mongoose');

const EdgeSchema = new mongoose.Schema({
    sourceId: { type: String, required: true },
    targetId: { type: String, required: true },
    weight: { type: Number, required: true }, // Base Euclidean distance or custom weight
    floor: { type: Number, default: 1 }
});

EdgeSchema.index({ sourceId: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('Edge', EdgeSchema);
