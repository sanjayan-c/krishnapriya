// routes/article.js
const express = require('express');
const Article = require('./models/Article');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();
const requireAuth = require('./middleware/requireAuth');

const BROWSER_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ' + 'Chrome/122.0 Safari/537.36';

function normalizeUrl(url) {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
}

function isHttpUrl(url) {
    try {
        const u = new URL(normalizeUrl(url));
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
        return false;
    }
}

async function fetchHtml(url) {
    const res = await axios.get(url, {
        headers: {
            'User-Agent': BROWSER_UA,
            'Accept-Language': 'en-US,en;q=0.9',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: (s) => s >= 200 && s < 400, // allow redirects too
    });

    const contentType = String(res.headers['content-type'] || '');
    if (!contentType.includes('text/html')) {
        // Not HTML; return minimal metadata
        return { html: '', headers: res.headers, status: res.status };
    }
    return { html: res.data, headers: res.headers, status: res.status };
}

function pick($, selectors) {
    for (const sel of selectors) {
        const v = $(sel).attr('content') || $(sel).attr('href') || $(sel).text();
        if (v && String(v).trim()) return String(v).trim();
    }
    return '';
}

function extractDateFromText($) {
    const text = $('body').text();
    const re =
        /\b(\d{4}-\d{2}-\d{2}|\d{1,2}\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\s\d{1,2},\s\d{4})\b/i;
    const m = text.match(re);
    return m ? m[0] : '';
}

router.get('/metadata', async (req, res) => {
    try {
        const raw = req.query.url;
        if (!raw) return res.status(400).json({ error: 'URL is required' });

        const url = normalizeUrl(raw);
        if (!isHttpUrl(url)) return res.status(400).json({ error: 'Invalid URL' });

        const result = await fetchHtml(url);

        // If not HTML (e.g., direct file, some drive pages), give a safe fallback
        if (!result.html) {
            return res.status(200).json({
                title: url,
                image: '',
                description: '',
                date: '',
            });
        }

        const $ = cheerio.load(result.html, { decodeEntities: true });

        const title =
            pick($, ['meta[property="og:title"]', 'meta[name="twitter:title"]', 'meta[name="title"]']) ||
            $('title').first().text().trim();

        const image =
            pick($, ['meta[property="og:image"]', 'meta[name="twitter:image"]', 'link[rel="image_src"]']) ||
            // very light fallback: first large-ish image on the page
            $('img[src]')
                .filter((i, el) => {
                    const w = parseInt($(el).attr('width') || '0', 10);
                    const h = parseInt($(el).attr('height') || '0', 10);
                    return (w >= 200 && h >= 200) || (!isNaN(w) && w >= 200) || (!isNaN(h) && h >= 200);
                })
                .first()
                .attr('src') ||
            '';

        const description = pick($, [
            'meta[property="og:description"]',
            'meta[name="twitter:description"]',
            'meta[name="description"]',
        ]);

        // Try multiple common date tags
        const date =
            pick($, [
                'meta[property="article:published_time"]',
                'meta[name="article:published_time"]',
                'meta[name="date"]',
                'meta[property="og:updated_time"]',
                'time[datetime]',
            ]) ||
            extractDateFromText($) ||
            '';

        return res.status(200).json({
            title: title || 'Untitled',
            image: image || '',
            description: description || '',
            date,
        });
    } catch (error) {
        // Log for server debugging
        console.error('metadata error:', error?.response?.status, error?.response?.statusText, error?.message);
        const status = error?.response?.status || 500;
        return res.status(status).json({
            error: 'Error fetching metadata',
            details: error?.message || 'Unknown error',
        });
    }
});

/**
 * Create
 */
router.post('/', requireAuth, async (req, res) => {
    try {
        const { link } = req.body;
        if (!link) {
            return res.status(400).json({ message: 'link is required.' });
        }

        const doc = await Article.create({ link });
        return res.status(201).json(doc);
    } catch (error) {
        return res.status(500).json({ message: 'Error creating article', error: String(error) });
    }
});

/**
 * List (paginated)
 * GET /
 */
router.get('/', async (req, res) => {
    try {
        const items = await Article.find().sort({ createdAt: -1 }).lean();

        const total = items.length;

        return res.status(200).json({
            items,
            page: 1,
            limit: total, // report how many we actually returned
            total,
            pages: 1,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Error fetching articles',
            error: String(error),
        });
    }
});

/**
 * Get one
 */
router.get('/:id', async (req, res) => {
    try {
        const doc = await Article.findById(req.params.id).lean();
        if (!doc) return res.status(404).json({ message: 'Article not found' });
        return res.status(200).json(doc);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching article', error: String(error) });
    }
});

/**
 * Update
 */
router.put('/:id', requireAuth, async (req, res) => {
    try {
        const { link } = req.body;
        if (!link) {
            return res.status(400).json({ message: 'link is required to update.' });
        }

        const doc = await Article.findByIdAndUpdate(req.params.id, { $set: { link } }, { new: true });
        if (!doc) return res.status(404).json({ message: 'Article not found' });
        return res.status(200).json(doc);
    } catch (error) {
        return res.status(500).json({ message: 'Error updating article', error: String(error) });
    }
});

/**
 * Delete
 */
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const deleted = await Article.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Article not found' });
        return res.status(200).json({ message: 'Article deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting article', error: String(error) });
    }
});

module.exports = router;
