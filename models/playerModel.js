const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }, // hashed
    email: { type: String, default: '' },
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);
