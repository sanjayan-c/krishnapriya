// models/Exhibition.js
const mongoose = require('mongoose');

const exhibitionSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true, trim: true },
    imageTitle:   { type: String, default: '', trim: true },
    size:         { type: String, default: '', trim: true },
    location:     { type: String, default: '', trim: true },
    description:  { type: String, required: true, trim: true },
    date:         { type: String, default: '' },
    images:       { type: [String], required: true, default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exhibition', exhibitionSchema);
