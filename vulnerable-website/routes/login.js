const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("login", {
    user: false
  });
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
        res.render("login", {
          user: true
        });
      } else {
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect("/");
      }
    });
    db.close((err) => {
      if (err) {
        return console.error(err.message)
      }
    });
  }
});

module.exports = router;
