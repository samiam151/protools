/// @ts-check
// Parent Route: "/stem"
// Route handler for gettin audio stems

const express = require("express");
const router = express.Router();
const fs = require("fs");
let editMode = true;
let version = editMode ? "Edited" : "Full";
// Middleware

// Route Handlers
router.get("/", (req, res) => {
    let urlPrefix = editMode ? "./audiostems/jazz/short/" : "./audiostems/jazz/full/"
    let url = urlPrefix + req.query.stem;
    console.log(url);
    res.header("Content-Type", "octet/stream");

    console.log("--- Creating audio stream...");
    console.log(`Version: ${version}`);
    let readStream = fs.createReadStream(url);
    
    readStream.on("open", function(){
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