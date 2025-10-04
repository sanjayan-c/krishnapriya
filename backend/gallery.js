// routes/gallery.js
const express = require('express');
const multer = require('multer');
const GalleryItem = require('./models/GalleryItem');
const requireAuth = require('./middleware/requireAuth');

const router = express.Router();

// Multer in-memory for base64 conversion
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        files: 1,
        fileSize: 10 * 1024 * 1024, // 10MB
        fieldSize: 10 * 1024 * 1024, // ★ allow big JSON/text fields (10MB)
    },
});

// Helper: get image from either file or JSON body
function collectImage(req) {
    // 1) multipart file -> base64
    if (req.file) return req.file.buffer.toString('base64');

    // 2) JSON body: image as base64 string
    if (req.body && typeof req.body.image === 'string' && req.body.image.trim()) {
        return req.body.image.trim();
    }
    return null;
}

/**
 * Create a gallery item
 * Accepts:
 *  - multipart/form-data with "image" file
 *  - application/json with "image" base64
 */
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
    try {
        const { title } = req.body;
        const image = collectImage(req);

        if (!title) {
            return res.status(400).json({ message: 'title is required.' });
        }
        if (!image) {
            return res.status(400).json({ message: 'image is required.' });
        }

        const doc = await GalleryItem.create({ title, image });
        return res.status(201).json(doc);
    } catch (error) {
        return res.status(500).json({ message: 'Error creating gallery item', error: String(error) });
    }
});

/**
 * List (paginated)
 * GET
 * Sorted newest first
 */
router.get('/', async (req, res) => {
    try {
        const items = await GalleryItem.find().sort({ createdAt: -1 }).lean();
        const total = items.length;

        return res.status(200).json({
            items,
            page: 1,
            limit: total,
            total,
            pages: 1,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error fetching gallery items',
            error: String(error),
        });
    }
});

/**
 * Get one by id
 */
router.get('/:id', async (req, res) => {
    try {
        const doc = await GalleryItem.findById(req.params.id).lean();
        if (!doc) return res.status(404).json({ message: 'Gallery item not found' });
        return res.status(200).json(doc);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching gallery item', error: String(error) });
    }
});

/**
 * Update (partial)
 * If a new image is provided (file or JSON.image), it replaces the current image.
 * If not provided, existing image remains.
 */
router.put('/:id', requireAuth, upload.single('image'), async (req, res) => {
    try {
        const { title } = req.body;
        const maybeImage = collectImage(req);

        const setData = {};
        if (title !== undefined) setData.title = title;
        if (maybeImage) setData.image = maybeImage;

        if (!Object.keys(setData).length) {
            return res.status(400).json({ message: 'No valid fields to update.' });
        }

        const doc = await GalleryItem.findByIdAndUpdate(req.params.id, { $set: setData }, { new: true });
        if (!doc) return res.status(404).json({ message: 'Gallery item not found' });
        return res.status(200).json(doc);
    } catch (error) {
        return res.status(500).json({ message: 'Error updating gallery item', error: String(error) });
    }
});

/**
 * Delete one
 */
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const deleted = await GalleryItem.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Gallery item not found' });
        return res.status(200).json({ message: 'Gallery item deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting gallery item', error: String(error) });
    }
});

// routes/gallery.js (add at bottom)
// router.get('/:id/image', async (req, res) => {
//     try {
//         const doc = await GalleryItem.findById(req.params.id).lean();
//         if (!doc) return res.status(404).send('Not found');

//         // doc.image is base64 — detect/assume png; adjust if you store mime type
//         const buf = Buffer.from(doc.image, 'base64');
//         res.set('Content-Type', doc.mimeType || 'image/png');
//         // Cache for 7 days; tweak as you like
//         res.set('Cache-Control', 'public, max-age=604800, immutable');
//         return res.send(buf);
//     } catch (e) {
//         return res.status(500).send('Error loading image');
//     }
// });

module.exports = router;
