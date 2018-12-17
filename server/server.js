// Dependencies
var express = require("express");
const app = express();
const Routes = require("./RouteManager");
const fs = require("fs");
const compression = require("compression");
const PORT = process.env.PORT || 5775
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);


// Global Middleware
app.use(compression());
// app.use(helmet());
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static("public"));
// app.use(cookieParser());
// app.use(session({
//     secret: 'supernova',
//     store: new RedisStore({ 
//         host: 'localhost', 
//         port: 6379
//     }),
//     saveUninitialized: false,
//     resave: false
// }));

// Global Routes
app.use("/", Routes.home);
app.use("/user", Routes.user);
app.use("/api/stem", Routes.stem);


// Initialization
app.listen(PORT, function(){
    console.log(`App started on port ${PORT}...`)
});
