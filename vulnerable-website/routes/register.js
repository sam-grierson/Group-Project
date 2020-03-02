const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("register", {
      success: false,
      passwordNoMatch: false
  });
});

router.post("/", (req, res) => {
  let id = 1
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let passwordTwo = req.body.passwordTwo;
  let sql = `INSERT INTO users VALUES(?, ?, ?)`

  if (username && email && password && passwordTwo) {
    if (password !== passwordTwo) {
      res.render("register", {
        success: false,
        passwordNoMatch: true
      });
    } else {
      let db = new sqlite3.Database("db/database.db", (err) => {
        if (err) {
          return console.error(err.message);
        }
      });

      db.run(sql, [id,username,password], (err) => {
        if (err) {
          return console.error(err.message);
        }
      });
      res.render("register", {
        success: true,
        passwordNoMatch: false
      });
    }
  }
});

module.exports = router;