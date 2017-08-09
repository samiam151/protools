var express = require("express");
const app = express();
const compression = require("compression");
const PORT = 5775
const bodyParser = require("body-parser");
const homePage = __dirname + "/index.html";

// Middleware
app.use(compression());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static("public"));

// Routing
app.get('/', (req, res) => {
    console.log("Fetching page...");
    res.sendFile(homePage);
});

// Initialization
app.listen(PORT, function(){
    console.log(`App started on port ${PORT}...`)
});
