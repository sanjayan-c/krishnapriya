// routes/testimonial.js
const express = require('express');
const Testimonial = require('./models/Testimonial');
const requireAuth = require('./middleware/requireAuth');

const router = express.Router();

/**
 * Create
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { description, name, position } = req.body;

    if (!description || !name) {
      return res.status(400).json({ message: 'description and name are required.' });
    }

    const doc = await Testimonial.create({ description, name, position });
    return res.status(201).json(doc);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating testimonial', error: String(error) });
  }
});

/**
 * List (paginated)
 * GET
 */
router.get('/', async (req, res) => {
  try {
    const items = await Testimonial.find()
      .sort({ createdAt: -1 })
      .lean();

    const total = items.length;

    return res.status(200).json({
      items,
      page: 1,
      limit: total,   // number of items returned
      total,
      pages: 1,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error fetching testimonials',
      error: String(error),
    });
  }
});


/**
 * Get one
 */
router.get('/:id', async (req, res) => {
  try {
    const doc = await Testimonial.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: 'Testimonial not found' });
    return res.status(200).json(doc);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching testimonial', error: String(error) });
  }
});

/**
 * Update
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { description, name, position } = req.body;
    const setData = {};
    if (description !== undefined) setData.description = description;
    if (name !== undefined) setData.name = name;
    if (position !== undefined) setData.position = position;

    if (!Object.keys(setData).length) {
      return res.status(400).json({ message: 'No valid fields to update.' });
    }

    const doc = await Testimonial.findByIdAndUpdate(req.params.id, { $set: setData }, { new: true });
    if (!doc) return res.status(404).json({ message: 'Testimonial not found' });
    return res.status(200).json(doc);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating testimonial', error: String(error) });
  }
});

/**
 * Delete
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const deleted = await Testimonial.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Testimonial not found' });
    return res.status(200).json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting testimonial', error: String(error) });
  }
});

module.exports = router;
