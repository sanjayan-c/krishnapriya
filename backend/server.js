require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

// routes
const galleryRoutes = require('./gallery');
const exhibitionRoutes = require('./exhibition');
const articleRoutes = require('./article');
const contactRoutes = require('./contact');
const testimonialRoutes = require('./testimonial');
const authRoutes = require('./auth');
const shareRoutes = require('./share');

// models
const AuthUser = require('./models/AuthUser');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 8070;

/* ---------- Security & body parsing ---------- */
app.use(helmet());
// app.use(cors({ origin: '*' }));
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

/* ---------- Static ---------- */
app.use('/uploads', express.static('uploads'));

/* ---------- Mongo ---------- */
mongoose.set('strictQuery', true);
mongoose
    .connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: process.env.MONGO_DB || undefined,
    })
    .then(async () => {
        console.log('Mongodb Connection Success!');

        // Seed a single admin user if none exists
        const count = await AuthUser.countDocuments();
        if (count === 0) {
            const username = (process.env.ADMIN_USERNAME || 'admin').toLowerCase().trim();
            const password = process.env.ADMIN_PASSWORD || 'ChangeMeNow!123';
            const passwordHash = await bcrypt.hash(password, 12);
            await AuthUser.create({ username, passwordHash });
            console.log(`Seeded admin user "${username}"`);
        }
    })
    .catch((err) => {
        console.error('Mongo connection error:', err);
        process.exit(1);
    });

app.set('trust proxy', 1);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/galleries', galleryRoutes);
app.use('/api/exhibitions', exhibitionRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/share', shareRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

/* ---------- Error handler (last) ---------- */
app.use((err, req, res, next) => {
    console.error(err);
    return res.status(500).json({ message: 'Unexpected error' });
});

// Start the Server
module.exports = app;
// Start the Server
// app.listen(PORT, () => {
//     console.log('Server is up and running on port no ' + PORT);
// });
