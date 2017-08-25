/// @ts-check
// Parent Route: "/stem"
// Route handler for gettin audio stems

const express = require("express");
const router = express.Router();
const fs = require("fs");
const StemService = require("../services/stem--service/stem-service").StemService;

let editMode = false;
let version = editMode ? "Edited" : "Full";
// Middleware

// Route Handlers
router.get("/", (req, res) => {
    let objectName = req.query.name,
        bucket = req.query.bucket;

    res.header("Content-Type", "application/octet-stream");
    res.header('Access-Control-Allow-Origin', '*');

    console.log(`--- Creating audio stream for ${bucket}/${objectName}...`);

    // let stemList = null;
 
    StemService.getStemObject(bucket, objectName).then(data => {
        console.log(typeof data.Body);
        res.write(data.Body);
        res.end();
    }).catch(err => console.log(err));

});

router.get("/list", (req, res) => {
    res.header("Content-Type", "application/json");
    let bucket = req.query.bucket;
    StemService.getStemList(bucket).then(data => {
        // let urls = data.names.map(name => {
        //     return "http://bulhtriostems.s3-external-1.amazonaws.com/" + name;
        // });

        res.write(data);
        res.end();
    })
});

module.exports = router;