const express = require('express');
const multer = require('multer');
const Article = require('./models/Article'); // Import Article schema
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

// Multer configuration (memory storage for base64 conversion)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/metadata', async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        const metadata = {
            title: $('meta[property="og:title"]').attr('content') || $('title').text(),
            image: $('meta[property="og:image"]').attr('content') || '',
            description: $('meta[property="og:description"]').attr('content') || '',
            date: $('meta[property="article:published_time"]').attr('content') || // Common Open Graph property
                  $('meta[name="date"]').attr('content') ||                      // General meta tag
                  $('time').attr('datetime') ||                                 // <time> tag in HTML
                  extractDateFromText($) ||                                     // Fallback to text extraction
                  '',                                                            // Default if no date found
        };

        res.status(200).json(metadata);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching metadata', details: error.message });
    }
});

// Helper function to extract date from text content
function extractDateFromText($) {
    // Look for common patterns in the webpage text
    const textContent = $('body').text();

    // Regular expression to match date formats (e.g., "2024-12-20" or "December 20, 2024")
    const dateRegex = /\b(\d{4}-\d{2}-\d{2})\b|(\b\w+\s\d{1,2},\s\d{4}\b)/;
    const match = textContent.match(dateRegex);

    if (match) {
        return match[0]; // Return the matched date
    }

    return null; // Return null if no date is found
}

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
