var express = require("express");
const app = express();
const fs = require("fs");
const compression = require("compression");
const PORT = 5775
const bodyParser = require("body-parser");
const homePage = __dirname + "/index.html";
const helmet = require("helmet");

// Middleware
app.use(compression());
app.use(helmet());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static("public"));

// Routing
app.get('/', (req, res) => {
    console.log("Fetching page...");
    res.sendFile(homePage);
});

app.get("/stem", (req, res) => {
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

// Initialization
app.listen(PORT, function(){
    console.log(`App started on port ${PORT}...`)
});
