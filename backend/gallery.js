// routes/gallery.js
const express = require('express');
const multer = require('multer');
const crypto = require('crypto');

const GalleryItem = require('./models/GalleryItem');
const requireAuth = require('./middleware/requireAuth');

const router = express.Router();

/* ----------------------- Helpers ----------------------- */

/** Basic sync MIME sniffer using magic numbers (no deps). */
function sniffMimeFromBuffer(buf) {
    if (!buf || buf.length < 4) return 'application/octet-stream';

    // JPEG: FF D8 FF
    if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'image/jpeg';

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
        buf.length >= 8 &&
        buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47 &&
        buf[4] === 0x0D && buf[5] === 0x0A && buf[6] === 0x1A && buf[7] === 0x0A
    ) return 'image/png';

    // GIF87a / GIF89a
    if (
        buf.length >= 6 &&
        buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38 &&
        (buf[4] === 0x37 || buf[4] === 0x39) && buf[5] === 0x61
    ) return 'image/gif';

    // WebP: "RIFF"...."WEBP"
    if (
        buf.length >= 12 &&
        buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
        buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
    ) return 'image/webp';

    // BMP: "BM"
    if (buf[0] === 0x42 && buf[1] === 0x4D) return 'image/bmp';

    // TIFF: 49 49 2A 00 or 4D 4D 00 2A
    if (
        (buf[0] === 0x49 && buf[1] === 0x49 && buf[2] === 0x2A && buf[3] === 0x00) ||
        (buf[0] === 0x4D && buf[1] === 0x4D && buf[2] === 0x00 && buf[3] === 0x2A)
    ) return 'image/tiff';

    // ICO: 00 00 01 00
    if (buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01 && buf[3] === 0x00) return 'image/x-icon';

    // HEIC/HEIF/AVIF: 'ftyp' + brand @ offset 4
    if (buf.length >= 12 && buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) {
        const brand = buf.slice(8, 12).toString('ascii');
        if (brand.includes('heic') || brand.includes('heif') || brand.includes('mif1')) return 'image/heic';
        if (brand.includes('avif')) return 'image/avif';
    }

    // SVG: starts with '<' and has '<svg'
    const head = buf.slice(0, Math.min(buf.length, 256)).toString('utf8').trim().toLowerCase();
    if (head.startsWith('<') && head.includes('<svg')) return 'image/svg+xml';

    return 'application/octet-stream';
}

/** Generate a simple ETag using md5 of id + updatedAt + size */
function makeETag(id, updatedAt, size) {
    const base = `${id}-${updatedAt ? new Date(updatedAt).getTime() : 0}-${size}`;
    return crypto.createHash('md5').update(base).digest('hex');
}

/** Multer in-memory for base64 conversion */
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        files: 1,
        fileSize: 10 * 1024 * 1024, // 10MB
        fieldSize: 10 * 1024 * 1024, // allow big JSON/text fields (10MB)
    },
});

/** Get image from either file (multipart) or JSON body (base64) */
function collectImage(req) {
    if (req.file) return req.file.buffer.toString('base64');
    if (req.body && typeof req.body.image === 'string' && req.body.image.trim()) {
        return req.body.image.trim();
    }
    return null;
}

/* ----------------------- Routes ----------------------- */

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

        if (!title) return res.status(400).json({ message: 'title is required.' });
        if (!image) return res.status(400).json({ message: 'image is required.' });

        const doc = await GalleryItem.create({ title, image });
        return res.status(201).json(doc);
    } catch (error) {
        return res
            .status(500)
            .json({ message: 'Error creating gallery item', error: String(error) });
    }
});

/**
 * List (paginated) — newest first
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
        return res
            .status(500)
            .json({ message: 'Error fetching gallery items', error: String(error) });
    }
});

/** Get one by id */
router.get('/:id', async (req, res) => {
    try {
        const doc = await GalleryItem.findById(req.params.id).lean();
        if (!doc) return res.status(404).json({ message: 'Gallery item not found' });
        return res.status(200).json(doc);
    } catch (error) {
        return res
            .status(500)
            .json({ message: 'Error fetching gallery item', error: String(error) });
    }
});

/**
 * Update (partial)
 * If a new image is provided (file or JSON.image), it replaces the current image.
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

        const doc = await GalleryItem.findByIdAndUpdate(
            req.params.id,
            { $set: setData },
            { new: true }
        );
        if (!doc) return res.status(404).json({ message: 'Gallery item not found' });
        return res.status(200).json(doc);
    } catch (error) {
        return res
            .status(500)
            .json({ message: 'Error updating gallery item', error: String(error) });
    }
});

/** Delete one */
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const deleted = await GalleryItem.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Gallery item not found' });
        return res.status(200).json({ message: 'Gallery item deleted successfully' });
    } catch (error) {
        return res
            .status(500)
            .json({ message: 'Error deleting gallery item', error: String(error) });
    }
});

/**
 * Serve gallery image with proper content-type & caching
 */
router.get('/:id/image', async (req, res) => {
    try {
        const doc = await GalleryItem.findById(req.params.id).lean();
        if (!doc || !doc.image) return res.status(404).send('Not found');

        const imgBuffer = Buffer.from(doc.image, 'base64');
        const contentType = sniffMimeFromBuffer(imgBuffer);

        const lastModified = doc.updatedAt ? new Date(doc.updatedAt) : new Date();
        const etag = makeETag(doc._id, doc.updatedAt, imgBuffer.length);

        // Conditional GET
        if (req.headers['if-none-match'] === etag) {
            res.status(304).end();
            return;
        }
        const ims = req.headers['if-modified-since'];
        if (ims && new Date(ims).getTime() >= lastModified.getTime()) {
            res.status(304).end();
            return;
        }

        res.set('Content-Type', contentType);
        res.set('Content-Length', String(imgBuffer.length));
        res.set('Cache-Control', 'public, max-age=604800, immutable'); // 7 days
        res.set('ETag', etag);
        res.set('Last-Modified', lastModified.toUTCString());

        return res.send(imgBuffer);
    } catch (error) {
        console.error('Error serving image:', error);
        return res.status(500).send('Error loading image');
    }
});

module.exports = router;
