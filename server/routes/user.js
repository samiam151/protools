const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Security = require("../utils/encryption");

const UserService = require("../services/user--service/user--service");

router.post("/auth", (req, res) => {
    let { username, password } = req.body;
    let hashedpw = Security.encrypt(password);
    UserService.authenticate(username, hashedpw)
        .then(data => {
            console.log(data.rows);  
            let tokenData = {
                userid: data.rows.id,
                username: data.rows.username
            };

            let result = {
                token: jwt.sign(tokenData, "test")
            }

            res.json(result);
        });
});

// Given a username and passowrd, should insert into table a new user
router.post("/add", (req, res) => {
    console.log(req.body);
    let { username, password } = req.body;
    let hashedpw = Security.encrypt(password);
    UserService.addUser(username, hashedpw)
    .then(data => {
        console.log(data);
        res.redirect("/");                                                                                 
    });
});      

router.post("/delete", (req, res) => {
    let { username, password } = req.body;
    let hashedpw = Security.encrypt(password);
    UserService.deleteUser(username, hashedpw)
    .then(data => { 
        console.log(data);
        res.redirect("/");
    });
});

module.exports = router;