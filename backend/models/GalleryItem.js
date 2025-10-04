// models/GalleryItem.js
const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image:       { type: String, required: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
