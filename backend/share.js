// routes/share.js
const express = require('express');
const GalleryItem = require('./models/GalleryItem');

const router = express.Router();

// SEO/OG share route for gallery items
router.get('/art/:id', async (req, res) => {
    try {
        const item = await GalleryItem.findById(req.params.id).lean();
        
        if (!item) {
            return res.status(404).send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Artwork Not Found</title>
    <meta name="description" content="Artwork not found">
</head>
<body>
    <h1>Artwork not found</h1>
    <p>The requested artwork could not be found.</p>
</body>
</html>`);
        }
        
        // Get the base URL for constructing image URLs
        //const baseUrl = `${req.protocol}://${req.get('host')}`;
        const publicBase = process.env.REACT_APP_BASE_URL?.replace(/\/+$/, '');
        const baseUrl = publicBase || `${req.protocol}://${req.get('host')}`;
        const imageUrl = `${baseUrl}/api/galleries/${req.params.id}/image`;
        const redirectUrl = `${process.env.FRONTEND_URL || baseUrl}/gallery?art=${req.params.id}`;
        
        // HTML template with Open Graph and Twitter meta tags
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${item.title}</title>
    <meta name="description" content="${item.title} - Artwork Gallery">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${redirectUrl}">
    <meta property="og:title" content="${item.title}">
    <meta property="og:description" content="${item.title} - Artwork Gallery">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:secure_url" content="${imageUrl.replace('http://','https://')}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:site_name" content="Art Gallery">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="${redirectUrl}">
    <meta property="twitter:title" content="${item.title}">
    <meta property="twitter:description" content="${item.title} - Artwork Gallery">
    <meta property="twitter:image" content="${imageUrl}">
    
    <!-- Redirect for human visitors -->
    <meta http-equiv="refresh" content="0;url=${redirectUrl}">
    <script>
        setTimeout(function() {
            window.location.href = "${redirectUrl}";
        }, 100);
    </script>
</head>
<body>
    <p>If you are not redirected automatically, <a href="${redirectUrl}">click here</a> to view the artwork.</p>
</body>
</html>`;
        
        res.set('Content-Type', 'text/html');
        res.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
        return res.send(html);
    } catch (error) {
        console.error('Error generating share page:', error);
        return res.status(500).send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Error</title>
</head>
<body>
    <h1>Error loading artwork</h1>
    <p>There was an error loading the requested artwork.</p>
</body>
</html>`);
    }
});

module.exports = router;