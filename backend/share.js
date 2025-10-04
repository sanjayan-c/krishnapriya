// share.js
const express = require('express');
const GalleryItem = require('./models/GalleryItem');

const router = express.Router();

function escapeHtml(s = '') {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Human-friendly share URL that contains OG/Twitter meta tags.
 * Example: https://your-domain.com/share/gallery/<id>
 * Crawlers read this page for previews; humans are redirected to your SPA.
 */
router.get('/gallery/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await GalleryItem.findById(id).lean();
        if (!doc) return res.status(404).send('Not found');

        // Origins
        const PUBLIC_ORIGIN = `${req.protocol}://${req.get('host')}`; // this share page host
        const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || PUBLIC_ORIGIN;
        const API_ORIGIN = process.env.API_ORIGIN || PUBLIC_ORIGIN;

        // Canonical (this page), image (absolute), and human redirect target
        const canonicalUrl = `${PUBLIC_ORIGIN}/share/gallery/${id}`;
        const publicImageUrl = `${API_ORIGIN}/api/galleries/${id}/image`;
        const fallbackUrl = `${FRONTEND_ORIGIN}/gallery?art=${id}`;

        res.set('Content-Type', 'text/html; charset=utf-8');
        res.send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(doc.title)} | Gallery</title>
  <link rel="canonical" href="${canonicalUrl}" />

  <!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:title" content="${escapeHtml(doc.title)}">

<!-- Hide description line: use empty content -->
<meta property="og:description" content="">

<!-- Strong image hints -->
<meta property="og:image" content="${publicOgImageUrl}">
<meta property="og:image:secure_url" content="${publicOgImageUrl}">
<meta property="og:image:type" content="image/jpeg">   <!-- we'll serve JPEG below -->
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${escapeHtml(doc.title)}">

<meta property="og:site_name" content="Your Site Name">

<!-- Twitter (optional; WA ignores) -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(doc.title)}">
<meta name="twitter:description" content="">
<meta name="twitter:image" content="${publicOgImageUrl}">

  <!-- Tiny delay helps you view-source during dev -->
  <meta http-equiv="refresh" content="1;url=${fallbackUrl}">
  <script>setTimeout(function(){ window.location.replace(${JSON.stringify(fallbackUrl)}); }, 300);</script>
</head>
<body>
  <p>Redirecting to the gallery… If you are not redirected, <a href="${fallbackUrl}">click here</a>.</p>
  <noscript><meta http-equiv="refresh" content="0;url=${fallbackUrl}"></noscript>
</body>
</html>`);
    } catch (e) {
        return res.status(500).send('Error creating share page');
    }
});

module.exports = router;
