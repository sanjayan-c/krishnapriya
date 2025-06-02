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
        from: `"${fname} ${lname}" <${email}>`,
        to: process.env.RECEIVER_EMAIL,
        subject: `New Message from ${fname} ${lname}`,
        html: `
      <!-- Container -->
      <div style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif; line-height:1.5; color:#333;">
        <!-- Header Bar -->
        <div style="background-color:#5B002D; padding:20px; text-align:center;">
          <h1 style="margin:0; font-size:24px; color:#ffffff;">You've Got Mail 🎨</h1>
        </div>

        <!-- Body -->
        <div style="background-color:#ffffff; margin:0 auto; max-width:600px; padding:30px;">
          <!-- Introduction -->
          <p style="margin:0 0 20px 0; font-size:16px;">
            Hello!
          </p>
          <p style="margin:0 0 20px 0; font-size:16px;">
            You have a new contact form submission. Below are the details:
          </p>

          <!-- Divider -->
          <hr style="border:none; border-top:2px solid #5B002D; margin:20px 0;">

          <!-- Sender Info -->
          <table cellpadding="0" cellspacing="0" border="0" style="width:100%; margin-bottom:20px;">
            <tr>
              <td style="width:30%; font-weight:bold; color:#5B002D;">Name:</td>
              <td>${fname} ${lname}</td>
            </tr>
            <tr>
              <td style="width:30%; font-weight:bold; color:#5B002D; padding-top:10px;">Email:</td>
              <td style="padding-top:10px;"><a href="mailto:${email}" style="color:#5B002D; text-decoration:none;">${email}</a></td>
            </tr>
          </table>

          <!-- Message Section -->
          <div style="background:#f9f9f9; border-radius:4px; padding:20px; margin-bottom:30px;">
            <p style="margin:0 0 10px 0; font-style:italic; color:#555;">Message:</p>
            <p style="margin:0; white-space:pre-wrap;">${message}</p>
          </div>

          <!-- Footer Note -->
          <p style="margin:0; font-size:14px; color:#777;">
            Thanks for using the contact form. We’ll get back to you as soon as possible.
          </p>
        </div>

        <!-- Footer Bar -->
        <div style="background-color:#5B002D; padding:15px; text-align:center; color:#ffffff; font-size:12px;">
          <p style="margin:0;">
            &copy; ${new Date().getFullYear()} YourArtistName. All rights reserved.
          </p>
        </div>
      </div>
    `,
    };

    try {
        // Send email
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Thank you for reaching out! I received your message and will get back to you shortly.' });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'An error occurred while sending your message. Please try again later.' });
    }
});

module.exports = router;
