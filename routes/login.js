const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", {
    user: false
  });
  console.log("try again");
});

router.post("/", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let sql = `SELECT * FROM users WHERE username = ? AND password = ?`;

  if (username && password) {
    let db = new sqlite3.Database("db/database.db", (err) => {
      if (err) {
        return console.error(err.message);
      }
    });

    db.get(sql, [username, password], (err, user) => {
      if (err) {
        return console.error(err.message);
      } else if (!user) {
        res.redirect('/')
        console.log("falid to login");
      } if (username == "Admin") {
        req.session.isadmin = true;
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect("/");
      } else {
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect("/");
        console.log("Loged in");
      }
    });
    db.close((err) => {
      if (err) {
        return console.error(err.message)
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
        console.log("Bey");
      }
    });
  }
});

module.exports = router;
