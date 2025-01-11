// models/Exhibition.js
const mongoose = require('mongoose');

const exhibitionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: String }, // Use Date type for proper date handling
    images: { type: [String], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Exhibition', exhibitionSchema);
