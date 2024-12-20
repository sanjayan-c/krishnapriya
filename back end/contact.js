// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a router
const router = express.Router();

// Middleware for parsing JSON
router.use(bodyParser.json());

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
    },
});

// Endpoint to handle form submissions
router.post('/', async (req, res) => {
    const { fname, lname, email, message } = req.body;

    // Validate input
    if (!fname || !lname || !email || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Email options
    const mailOptions = {
        from: email,
        to: process.env.RECEIVER_EMAIL, // Your email to receive the contact messages
        subject: `Contact Us Form Submission from ${fname} ${lname}`,
        text: `Name: ${fname} ${lname}\nEmail: ${email}\nMessage: ${message}`,
    };

    try {
        // Send email
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Your message has been sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'An error occurred while sending your message. Please try again later.' });
    }
});

module.exports = router;
