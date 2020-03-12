const express = require("express");
const router = express.Router();


const Cart = require("../models/cart");
const Sqlite = require("../models/sqlite");


/*router.get("/", (req, res) => {
  res.render("index", {
    user: false
  });
  console.log("try again");
});*/

// register route
router.post("/register", (req, res) => {
  let sqlite = new Sqlite();
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let passwordTwo = req.body.passwordTwo;

  if (username && email && password && passwordTwo) {
    if (password !== passwordTwo) {
      res.redirect('/');
    } else {
      sqlite.registerUser(username, password, email, (err, result) => {
        if (err.message == "SQLITE_CONSTRAINT: UNIQUE constraint failed: users.username") {
          return console.log("duplicate username error");
        } else if (err) {
          res.redirect("/")
        } else {
          res.redirect("/");
        }
      });
    }
  }
});

// login route
router.post("/login", (req, res) => {
  let sqlite = new Sqlite();
  let username = req.body.username;
  let password = req.body.password;

  if (username && password) {
    sqlite.loginUser(username, password, (err, row) => {
      if (err) {
        res.redirect("/");
      } else if (!row) {
        console.log("failed to login");
        res.redirect("/")
      } else if (username == "Admin") {
        req.session.isadmin = true;
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect("/");
      } else {
        req.session.loggedin = true;
        req.session.username = username;
        res.redirect("/");
        console.log("Logged in");
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
        console.log("Bye");
      }
    });
  }
});

router.get('/profile', function(req,res){
  let sqlite = new Sqlite();
  let session = req.session;
  let cart = new Cart(req.session.cart ? req.session.cart : {});
  let userId = getUser(session);



  function getUser(session) {
    if (session.loggedin === true) {
      return req.session.username;
    } else {
      return false;
    }
  }
  sqlite.getProfile(userId, (err,row) => {

    if (err) {
      console.error(err);
      return res.redirect('/');
    } else {
      res.render('profile', {
        cartCount: cart.totalQty,
        products: cart.generateArray(),
        total: cart.totalPrice,
        name: getUser(session),
        username: row.username,
        email: row.Email,
        pass: row.password,
        edit: false,
      });
    }
  });
});

router.post('/update-profile', (req, res) => {
  let sqlite = new Sqlite();
  let session = req.session;
  let cart = new Cart(req.session.cart ? req.session.cart : {});
  let userId = getUser(session);
  let email = req.body.email;


  function getUser(session) {
    if (session.loggedin === true) {
      return req.session.username;
    } else {
      return false;
    }
  }

  sqlite.updateProfile(req.session.username,email, (err,row) => {
    console.log(row);
    if (err) {
      console.error(err);
      return res.redirect('/');
    } else {
      console.log('here');
      res.redirect('/');
    }
  });
});

module.exports = router;
