const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const router = express.Router();

/*router.get("/", (req, res) => {
  res.render("index", {
    user: false
  });
  console.log("try again");
});*/

// register route
router.post("/register", (req, res) => {
  let id = 1
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let passwordTwo = req.body.passwordTwo;
  let sql = `INSERT INTO users(username,password,email) VALUES(?, ?, ?)`
  //^changed to make the primary key AUTOINCREMENT function work properly, now id is autoincremented to
  // one per user, making all id's unique.

  if (username && email && password && passwordTwo) {
    if (password !== passwordTwo) {
      res.redirect('/');
    } else {
      let db = new sqlite3.Database("db/database.db", (err) => {
        if (err) {
          return console.error(err.code);
        }
      });

      db.run(sql, [username,password,email], (err) => {
        if (err.message == 'SQLITE_CONSTRAINT: UNIQUE constraint failed: users.username') {
          return console.log('catching the error');

        } else if (err){
          return console.error(err.message);
        }
      });
      res.redirect('/');
    }
  }
});

// login route
router.post("/login", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let sql = `SELECT * FROM users WHERE username = ? AND password = ?`;

  if (username && password) {
    let db = new sqlite3.Database("db/database.db", (err) => {
      if (err) {
        return console.error(err.message);
      }
    });

    db.get(sql, [username, password], (err, rows) => {
      if (err) {
        return console.error(err.message);
      } else if (!rows) {
        res.render('index', {
          // we have to pass the all variables
        });
        return console.log("falid to login");
      } else if (username == "Admin") {
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

// logout route
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
