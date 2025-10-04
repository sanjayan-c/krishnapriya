// models/Testimonial.js
const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    name:        { type: String, required: true, trim: true },
    position:    { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
