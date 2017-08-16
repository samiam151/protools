/// @ts-check
// Parent Route: "/stem"
// Route handler for gettin audio stems

const express = require("express");
const router = express.Router();
const fs = require("fs");
const homePage = "/index.html";

let index = 0;

// Middleware

// Route Handlers
router.get("/", (req, res) => {
    console.log(`Index: ${index}`);
    index++;
    res.sendFile(homePage, {
        root: "./"
    });
});

module.exports = router;