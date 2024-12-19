const express = require('express');
const multer = require('multer');
const Article = require('./models/Article'); // Import Article schema

const router = express.Router();

// Multer configuration (memory storage for base64 conversion)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create a new article
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, description, date, link } = req.body;
        let image = null;

        if (req.file) {
            // Convert image to base64
            image = req.file.buffer.toString('base64');
        }

        const newArticle = new Article({
            title,
            description,
            date,
            image,
            link,
        });

        const savedArticle = await newArticle.save();
        res.status(201).json(savedArticle);
    } catch (error) {
        res.status(500).json({ message: 'Error creating article', error });
    }
});

// Get all articles
router.get('/', async (req, res) => {
    try {
        const articles = await Article.find();
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching articles', error });
    }
});

// Get a single article by ID
router.get('/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) return res.status(404).json({ message: 'Article not found' });
        res.status(200).json(article);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching article', error });
    }
});

// Update an article
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, description, date, link } = req.body;
        const updateData = { title, description, date, link };

        if (req.file) {
            // Convert updated image to base64
            updateData.image = req.file.buffer.toString('base64');
        }

        const updatedArticle = await Article.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedArticle) return res.status(404).json({ message: 'Article not found' });
        res.status(200).json(updatedArticle);
    } catch (error) {
        res.status(500).json({ message: 'Error updating article', error });
    }
});

// Delete an article
router.delete('/:id', async (req, res) => {
    try {
        const deletedArticle = await Article.findByIdAndDelete(req.params.id);
        if (!deletedArticle) return res.status(404).json({ message: 'Article not found' });

        res.status(200).json({ message: 'Article deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting article', error });
    }
});

module.exports = router;
