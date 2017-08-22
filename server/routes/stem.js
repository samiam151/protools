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
    // let urlPrefix = editMode ? "./audiostems/jazz/short/" : "./audiostems/jazz/full/";
    // let baseUrl = "./audiostems/jazz";
    // let urlPrefix = baseUrl + editMode ? "/short/" : "/full/";
    // let url = urlPrefix + req.query.stem;
    // console.log(url);
    res.header("Content-Type", "applcation/json");

    console.log("--- Creating audio stream...");
    console.log(`Version: ${version}`);

    // let stemList = null;

    StemService.getStemList("bulhtriostems")
        .then(data => {
            console.log(data);
            let stemList = data  
                .map(objectName => {
                    return StemService.getStemObject("bulhtriostems", objectName); 
                });

            // console.log()
            // Promise.all(stemList).then(data => {
            //     res.send(data);
            // });
            console.log(stemList);
            res.send(stemList);
            // StemService.getStemObjects("bulhtriostems").then(data => {
            //     console.log(data);
            //     res.send(data);

        })
        .catch(err => {
            console.log(1);
            console.log(err);
        });
    // let readStream = fs.createReadStream(url);
    // });


    // readStream.on("open", function(){
    //     readStream.pipe(res)
    // });
    // readStream.on("error", (err) => {
    //     res.end(err);
    // });
    // readStream.on("close", () => {
    //     console.log("--- Stream closed...");
    // });
});

module.exports = router;