const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const md5 = require("md5");
require("dotenv").config();

const app = express();
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const User = mongoose.model("User", userSchema);

app.get("/", (req,res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    User.findOne({username: req.body.username}, (error, resultUser) => {
        if(error) {
            console.log(error);
        } else {
            if(resultUser){
                if(resultUser.password === md5(req.body.password)) {
                    res.render("secrets");
                }
            }
        }
    })
});

app.get("/register", (req,res) => {
    res.render("register");
});

app.post("/register", (req, res) => {

    const newUser = new User({
        username: req.body.username,
        password: md5(req.body.password)
    });

    newUser.save((error) => {
        if(error) {
            console.log(error);
        } else {
            res.render("secrets");
        }
    });
});

app.listen(3000, () => {
    console.log("Listening on port 3000");
})