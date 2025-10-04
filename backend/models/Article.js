// models/Article.js
const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    link: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Article', articleSchema);
