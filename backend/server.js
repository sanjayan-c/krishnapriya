const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const galleryRoutes = require("./gallery");
const exhibitionRoutes = require("./exhibition");
const articleRoutes = require("./article");
const contactRoutes = require('./contact');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8070;

// Middleware
app.use(cors());
app.use(express.json({ limit: "20mb", extended: true }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));
app.use("/uploads", express.static("uploads"));

// MongoDB Connection
const URL = process.env.MONGODB_URL;

mongoose.connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.set("strictQuery", true);

const connection = mongoose.connection;
connection.once("open", () => {
    console.log("Mongodb Connection Success!");
});

// Routes
app.use("/api/galleries", galleryRoutes);
app.use("/api/exhibitions", exhibitionRoutes);
app.use("/api/articles", articleRoutes);
app.use('/api/contact', contactRoutes);

// Start the Server
module.exports = app;
