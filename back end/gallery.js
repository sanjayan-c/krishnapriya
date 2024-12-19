const express = require('express');
const multer = require('multer');
const GalleryItem = require('./models/GalleryItem'); // Import GalleryItem schema

const router = express.Router();

// Multer configuration (for processing file uploads if needed in future)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create a new gallery item
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, description } = req.body;
        let image = null;

        if (req.file) {
            // Convert image to base64
            image = req.file.buffer.toString('base64');
        }

        const newGalleryItem = new GalleryItem({
            title,
            description,
            image,
        });

        const savedItem = await newGalleryItem.save();
        res.status(201).json(savedItem);
    } catch (error) {
        res.status(500).json({ message: 'Error creating gallery item', error });
    }
});

// Get all gallery items
router.get('/', async (req, res) => {
    try {
        const galleryItems = await GalleryItem.find();
        res.status(200).json(galleryItems);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching gallery items', error });
    }
});

// Get a single gallery item by ID
router.get('/:id', async (req, res) => {
    try {
        const galleryItem = await GalleryItem.findById(req.params.id);
        if (!galleryItem) return res.status(404).json({ message: 'Gallery item not found' });
        res.status(200).json(galleryItem);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching gallery item', error });
    }
});

// Update a gallery item
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, description } = req.body;
        const updateData = { title, description };

        if (req.file) {
            // Convert updated image to base64
            updateData.image = req.file.buffer.toString('base64');
        }

        const updatedItem = await GalleryItem.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedItem) return res.status(404).json({ message: 'Gallery item not found' });
        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: 'Error updating gallery item', error });
    }
});

// Delete a gallery item
router.delete('/:id', async (req, res) => {
    try {
        const deletedItem = await GalleryItem.findByIdAndDelete(req.params.id);
        if (!deletedItem) return res.status(404).json({ message: 'Gallery item not found' });

        res.status(200).json({ message: 'Gallery item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting gallery item', error });
    }
});

module.exports = router;
