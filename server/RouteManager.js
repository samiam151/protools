const routerStem  = require("./routes/stem");
const routerHome = require("./routes/home");
const routerUser = require("./routes/user");

const Routes = {
    home: routerHome,
    stem: routerStem,
    user: routerUser
}

module.exports = Routes;