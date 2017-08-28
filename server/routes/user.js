const express = require("express");
const router = express.Router();

const UserService = require("../services/user--service/user--service");

router.get("/login", (req, res) => {
    
});

// Given a username and passowrd, should insert into table a new user
router.post("/add", (req, res) => {
    console.log(req.body);
    let { username, password } = req.body;
    let hashedpw = UserService.encrypt(password);
    UserService.addUser(username, hashedpw)
        .then(res => {
            console.log(res);
        })
});

module.exports = router;