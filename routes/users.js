const express = require("express");
const router = express.Router();

const utils = require("../lib/utils");
const validate = require("../lib/validate");
const insecurity = require("../lib/insecurity");
const Cart = require("../models/cart");
const sqlite = require("../models/sqlite");

router.post("/register", (req, res, next) => {
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let passwordTwo = req.body.passwordTwo;
  let session = req.session;
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  let error = null;
  function checkError(error) {
    if (error === null) {
      return true;
    } else {
      return false;
    }
  }

  if (username && email && password && passwordTwo) {
    if (password !== passwordTwo) {
      error = "Passwords don't match";
    } else if (validate.isEmail(email) === false) {
      error = "Invalid email address";
    } else {
      sqlite.registerUser(username, insecurity.hash(password), email, (err, result) => {
        if (err) {
          if (err.errno == 19) {
            error = "Username has already been taken.";
          } else {
            error = err;
          }
        }
        sqlite.getProducts((productsErr, products) => {
          res.render("index", {
            cartCount: cart.totalQty,
            name: utils.getUser(session),
            products: products,
            loginError: null,
            registerError: error,
            registerSuccess: checkError(error),
            admin: req.session.isadmin,
            searched: null
          });
        });
      });
    }
    if (error !== null) {
      sqlite.getProducts((productsErr, products) => {
        res.render("index", {
          cartCount: cart.totalQty,
          name: utils.getUser(session),
          products: products,
          loginError: null,
          registerError: error,
          registerSuccess: checkError(error),
          admin: req.session.isadmin,
          searched: null
        });
      });
    }
  }
});

router.post("/login", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let session = req.session
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  if (username && password) {
    sqlite.loginUser(username, insecurity.hash(password), (err, row) => {
      if (err) {
        sqlite.getProducts((productErr, products) => {
          res.render("index", {
            cartCount: cart.totalQty,
            name: utils.getUser(session),
            products: products,
            loginError: err,
            registerError: null,
            registerSuccess: null,
            admin: req.session.isadmin,
            searched: null
          });
        });
      } else if (!row) {
        sqlite.getProducts((err, products) => {
          res.render("index", {
            cartCount: cart.totalQty,
            name: utils.getUser(session),
            products: products,
            loginError: "Invalid username/password.",
            registerError: null,
            registerSuccess: null,
            admin: req.session.isadmin,
            searched: null
          });
        });
      } else if (row.username == "Admin") {
        req.session.isadmin = true;
        req.session.loggedin = true;
        req.session.username = row.username;
        req.session.userID = row.id;
        res.redirect("/");
      } else {
        token = insecurity.authorize({ userID: row.id, username: row.username });
        console.log(token);
        req.session.isadmin = false;
        req.session.loggedin = true;
        req.session.username = row.username;
        req.session.userID = row.id;
        res.redirect("/");
      }
    });
  }
});

// logout route
router.get("/logout", (req, res) => {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        res.redirect('/');
      }
    });
  }
});

module.exports = router;
