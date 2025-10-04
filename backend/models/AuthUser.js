// models/AuthUser.js
const mongoose = require('mongoose');

const authUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

// Helpful index for uniqueness
authUserSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model('AuthUser', authUserSchema);
