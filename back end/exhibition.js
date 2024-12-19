const express = require('express');
const multer = require('multer');
const Exhibition = require('./models/Exhibition'); // Import Exhibition schema

const router = express.Router();

// Multer configuration (memory storage for base64 conversion)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create a new exhibition
router.post('/', upload.array('images'), async (req, res) => {
    try {
        const { title, description, date } = req.body; // 'date' comes from client-side date picker
        const images = req.files ? req.files.map(file => file.buffer.toString('base64')) : [];

        const newExhibition = new Exhibition({
            title,
            description,
            date, // The client provides the date in ISO format or a readable string
            images,
        });

        const savedExhibition = await newExhibition.save();
        res.status(201).json(savedExhibition);
    } catch (error) {
        res.status(500).json({ message: 'Error creating exhibition', error });
    }
});

// Get all exhibitions
router.get('/', async (req, res) => {
    try {
        const exhibitions = await Exhibition.find();
        res.status(200).json(exhibitions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exhibitions', error });
    }
});

// Get a single exhibition by ID
router.get('/:id', async (req, res) => {
    try {
        const exhibition = await Exhibition.findById(req.params.id);
        if (!exhibition) return res.status(404).json({ message: 'Exhibition not found' });
        res.status(200).json(exhibition);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exhibition', error });
    }
});

// Update an exhibition
router.put('/:id', upload.array('images'), async (req, res) => {
    try {
        const { title, description, date } = req.body; // 'date' comes from client-side date picker
        const updateData = { title, description, date };

        if (req.files) {
            updateData.images = req.files.map(file => file.buffer.toString('base64'));
        }

        const updatedExhibition = await Exhibition.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedExhibition) return res.status(404).json({ message: 'Exhibition not found' });
        res.status(200).json(updatedExhibition);
    } catch (error) {
        res.status(500).json({ message: 'Error updating exhibition', error });
    }
});

// Delete an exhibition
router.delete('/:id', async (req, res) => {
    try {
        const deletedExhibition = await Exhibition.findByIdAndDelete(req.params.id);
        if (!deletedExhibition) return res.status(404).json({ message: 'Exhibition not found' });

        res.status(200).json({ message: 'Exhibition deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting exhibition', error });
    }
});

module.exports = router;
