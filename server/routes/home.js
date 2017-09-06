/// @ts-check
// Parent Route: "/stem"
// Route handler for gettin audio stems

const express = require("express");
const router = express.Router();
const fs = require("fs");
const homePage = "/index.html";
const loginPage = "/templates/sign-in.html";

let index = 0;

// Middleware
 
// Route Handlers
router.get(["/", "/index.html"], (req, res) => {
    console.log(`Index: ${index}`);
    index++;
    res.sendFile(homePage, {
        root: "./"
    });
});

router.get("/sign-up", (req, res) => {
    console.log(`Login: ${index}`);
    index++;
    res.sendFile("/templates/sign-up.html", {
        root: "./server"
    });
});

router.get("/sign-in", (req, res) => {
    console.log(`Login: ${index}`);
    index++;
    res.sendFile("/templates/sign-in.html", {
        root: "./server"
    });
});

module.exports = router;