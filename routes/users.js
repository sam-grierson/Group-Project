const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const router = express.Router();

const Cart = require("../models/cart");

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

router.get('/profile', function(req,res){
  let db = new sqlite3.Database("db/database.db");
  let session = req.session;
  let cart = new Cart(req.session.cart ? req.session.cart : {});
  let userId = getUser(session);
  let sql = `SELECT * from users WHERE username = '${userId}'`;


  function getUser(session) {
    if (session.loggedin === true) {
      return req.session.username;
    } else {
      return false;
    }
  }
  db.all(sql, (err,result) => {
    console.log(result);
    if (err) {
      console.error(err);
      return res.redirect('/');
    } else {
      res.render('profile', {
        cartCount: cart.totalQty,
        products: cart.generateArray(),
        total: cart.totalPrice,
        name: getUser(session),
        username: result[0].username,
        email: result[0].Email,
        pass: result[0].password
      });
    }
  });

});

module.exports = router;
