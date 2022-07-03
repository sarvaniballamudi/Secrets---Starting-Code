const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const ejs = require("ejs");

require("dotenv").config();

const app = express();
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req,res) => {
    res.render("home");
});

app.get("/register", (req,res) => {
    res.render("register");
})

app.get("/login", (req,res) => {
    res.render("login");
})

app.get("/secrets", (req,res) => {
    if(req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
})

app.get("/logout", (req,res) => {
    req.logout((error) => {
        if(error) {
            console.log(error);
        } else {
            res.redirect("/");
        }
    });
});

app.post("/register", (req,res) => {
    User.register({username : req.body.username}, req.body.password, (error, user) => {
        if(error) {
            console.log(error);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        }
    });
});

app.post("/login", (req,res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, (error) => {
        if(error) {
            console.log(error);
        } else {
            passport.authenticate("local")(req, res, () => {
                res.redirect("/secrets");
            });
        }
    });
})

app.listen(3000, () => {
    console.log("Listening on port 3000");
})