const express = require("express");
const router = express.Router();

const Sqlite = require("../models/sqlite");
const sqlite = new Sqlite();

router.get("/", (req, res) => {
  res.render("index", {
    user: false
  });
  console.log("try again");
});

router.post("/", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;

  if (username && password) {
    sqlite.loginUser(username, password, (err, row) => {
      if (err) {
        return console.error(err.message);
      } else if (!user) {
        res.redirect('/')
        console.log("failed to login");
      } if (username == "Admin") {
        req.session.isadmin = true;
        req.session.loggedin = true;
        req.session.username = username;
        req.session.userID = user.id
        res.redirect("/");
      } else {
        req.session.loggedin = true;
        req.session.username = username;
        req.session.userID = user.id
        res.redirect("/");
        console.log(req.session.userID);
      }
    });
  }
});

router.get("/logout", function(req, res){
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        res.redirect('/');
        console.log("Bye");
      }
    });
  }
});

module.exports = router;
