const express = require("express");
const router = express.Router();
const fs = require("fs");
const homePage = "/index.html";

// Middleware
router.use((req, res, next) => {
    console.log("Fetching page...");
    next();
});

// Route Handlers
router.get("/", (req, res) => {
    res.sendFile(homePage, {
        root: "./"
    });
});

module.exports = router;