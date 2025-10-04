// routes/exhibition.js
const express = require('express');
const multer = require('multer');
const Exhibition = require('./models/Exhibition');
const requireAuth = require('./middleware/requireAuth');

const router = express.Router();

// Multer: memory for turning uploads into base64
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        files: 20, // sensible cap
        fileSize: 20 * 1024 * 1024, // 20MB/file
        fieldSize: 25 * 1024 * 1024, // ★ allow big JSON/text fields (25MB)
    },
});

// Helper: normalize images coming from either files or JSON
function collectImages(req) {
    // 1) files from multipart
    const fileImages = (req.files || []).map((f) => f.buffer.toString('base64'));

    // 2) base64 strings in JSON body: images: ["...","..."]
    //    Accept both string and array to be forgiving
    let jsonImages = [];
    if (req.body && req.body.images) {
        if (Array.isArray(req.body.images)) jsonImages = req.body.images.map(String);
        else if (typeof req.body.images === 'string') jsonImages = [req.body.images];
    }
    return [...jsonImages, ...fileImages].filter(Boolean);
}

function parseKeepImages(req) {
    try {
        const raw = req.body?.keepImages;
        if (!raw) return [];
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr.map(String).filter(Boolean) : [];
    } catch {
        return [];
    }
}

/**
 * Create
 * Accepts:
 * - multipart/form-data with fields and files (images[])
 * - application/json with images as base64 array
 */
router.post('/', requireAuth, upload.array('images'), async (req, res) => {
    try {
        const { title, imageTitle = '', size = '', location = '', description, date = '' } = req.body;

        const images = collectImages(req);

        if (!title || !description) {
            return res.status(400).json({ message: 'title and description are required.' });
        }
        if (!images.length) {
            return res.status(400).json({ message: 'At least one image is required.' });
        }

        const newExhibition = new Exhibition({
            title,
            imageTitle,
            size,
            location,
            description,
            date, // keep as received (e.g., "2016" or any string)
            images,
        });

        const saved = await newExhibition.save();
        return res.status(201).json(saved);
    } catch (error) {
        return res.status(500).json({ message: 'Error creating exhibition', error: String(error) });
    }
});

/**
 * List (paginated)
 * GET
 * Sorted newest first
 */
router.get('/', async (req, res) => {
    try {
        const items = await Exhibition.find().sort({ createdAt: -1 }).lean();

        const total = items.length;

        return res.status(200).json({
            items,
            page: 1,
            limit: total, // for consistency
            total,
            pages: 1,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error fetching exhibitions',
            error: String(error),
        });
    }
});

/**
 * Get one
 */
router.get('/:id', async (req, res) => {
    try {
        const exhibition = await Exhibition.findById(req.params.id).lean();
        if (!exhibition) return res.status(404).json({ message: 'Exhibition not found' });
        return res.status(200).json(exhibition);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching exhibition', error: String(error) });
    }
});

/**
 * Update (replace fields; images can be replaced OR appended)
 * - Replace images when `?replaceImages=true` (default)
 * - Append images when `?replaceImages=false`
 * Accepts images via files or JSON just like POST
 */
router.put('/:id', requireAuth, upload.array('images'), async (req, res) => {
    try {
        // 1) parse what the UI kept (existing tiles)
        const kept = parseKeepImages(req);

        // 2) collect newly uploaded images (files or JSON `images`)
        const incomingImages = collectImages(req);

        // 3) final list = what’s on the tiles now
        const finalImages = [...kept, ...incomingImages];

        // --- fields to set (only if provided) ---
        const { title, imageTitle, size, location, description, date } = req.body;
        const setData = {};
        if (title !== undefined) setData.title = title;
        if (imageTitle !== undefined) setData.imageTitle = imageTitle;
        if (size !== undefined) setData.size = size;
        if (location !== undefined) setData.location = location;
        if (description !== undefined) setData.description = description;
        if (date !== undefined) setData.date = date;

        // Require at least one image on save (optional; remove if you want to allow zero)
        if (!finalImages.length) {
            return res.status(400).json({ message: 'At least one image is required.' });
        }

        setData.images = finalImages;

        const doc = await Exhibition.findByIdAndUpdate(req.params.id, { $set: setData }, { new: true });
        if (!doc) return res.status(404).json({ message: 'Exhibition not found' });
        return res.status(200).json(doc);
    } catch (error) {
        return res.status(500).json({ message: 'Error updating exhibition', error: String(error) });
    }
});

/**
 * Delete one
 */
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const deleted = await Exhibition.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Exhibition not found' });
        return res.status(200).json({ message: 'Exhibition deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting exhibition', error: String(error) });
    }
});

/**
 * Delete a single image by index (optional helper)
 * DELETE /:id/images/:index
 */
router.delete('/:id/images/:index', requireAuth, async (req, res) => {
    try {
        const index = parseInt(req.params.index, 10);
        const doc = await Exhibition.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Exhibition not found' });

        if (Number.isNaN(index) || index < 0 || index >= doc.images.length) {
            return res.status(400).json({ message: 'Invalid image index' });
        }

        doc.images.splice(index, 1);
        await doc.save();
        return res.status(200).json(doc);
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting image', error: String(error) });
    }
});

module.exports = router;
