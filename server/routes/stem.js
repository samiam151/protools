const express = require("express");
const router = express.Router();
const fs = require("fs");

// Middleware
router.use((req, res, next) => {
    console.log("Accepting route to /stem...")
    next();
});

// Route Handlers
router.get("/", (req, res) => {
    let url = "./audio__stems/" + req.query.stem;
    console.log(url);

    res.header("Content-Type", "octet/stream");

    console.log("--- Creating audio stream...");
    let readStream = fs.createReadStream(url);
    
    readStream.on("open", function(){
        console.log("--- Sending audio stream...");
        readStream.pipe(res)
    });
    readStream.on("error", (err) => {
        res.end(err);
    });
    readStream.on("close", () => {
        console.log("--- Stream closed...");
    });
});

module.exports = router;