const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    floor: { type: Number, default: 1 },
    isEntrance: { type: Boolean, default: false },
    isExit: { type: Boolean, default: false },
    name: { type: String },
    qrId: { type: String, unique: true, sparse: true } // QR Code ID associated with this node
});

module.exports = mongoose.model('Node', NodeSchema);
