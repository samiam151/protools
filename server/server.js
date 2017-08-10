// Dependencies
var express = require("express");
const app = express();
const Routes = require("./RouteManager");
const fs = require("fs");
const compression = require("compression");
const PORT = 5775
const bodyParser = require("body-parser");
const helmet = require("helmet");

// Global Middleware
app.use(compression());
app.use(helmet());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static("public"));

// Global Routes
app.use("/", Routes.home);
app.use("/stem", Routes.stem);


// Initialization
app.listen(PORT, function(){
    console.log(`App started on port ${PORT}...`)
});
