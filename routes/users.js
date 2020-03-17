const express = require("express");
const router = express.Router();

const utils = require("../lib/utils");
const Cart = require("../models/cart");
const Sqlite = require("../models/sqlite");
const sqlite = new Sqlite();

// register route
router.post("/register", (req, res) => {
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let passwordTwo = req.body.passwordTwo;
  let session = req.session;
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  if (username && email && password && passwordTwo) {
    if (password !== passwordTwo) {
      sqlite.getProducts((productsErr, products) => {
        res.render("index", {
          cartCount: cart.totalQty,
          name: utils.getUser(session),
          products: products,
          loginError: null,
          registerError: "Passwords don't match",
          registerSuccess: null,
          admin: req.session.isadmin
        });
      });
    } else {
      sqlite.registerUser(username, password, email, (err, result) => {
        if (err) { 
          if (err.errno == 19) {
            sqlite.getProducts((productsErr, products) => {
              res.render("index", {
                cartCount: cart.totalQty,
                name: utils.getUser(session),
                products: products,
                loginError: null,
                registerError: "Username has already been taken.",
                registerSuccess: null,
                admin: req.session.isadmin
              });
            });
          } else {
            sqlite.getProducts((productsErr, products) => {
              res.render("index", {
                cartCount: cart.totalQty,
                name: utils.getUser(session),
                products: products,
                loginError: null,
                registerError: err,
                registerSuccess: null,
                admin: req.session.isadmin
              });
            });
          }
        } else {
          console.log("created new user account");
          sqlite.getProducts((productsErr, products) => {
            res.render("index", {
              cartCount: cart.totalQty,
              name: utils.getUser(session),
              products: products,
              loginError: null,
              registerError: null,
              registerSuccess: true,
              admin: req.session.isadmin
            });
          });
        }
      });
    }
  }
});

// login route
router.post("/login", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let session = req.session
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  if (username && password) {
    sqlite.loginUser(username, password, (err, row) => {
      if (err) {
        sqlite.getProducts((productErr, products) => {
          res.render("index", {
            cartCount: cart.totalQty,
            name: utils.getUser(session),
            products: products,
            loginError: err,
            registerError: null,
            registerSuccess: null,
            admin: req.session.isadmin
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
            admin: req.session.isadmin
          });
        });
      } else if (username == "Admin") {
        req.session.isadmin = true;
        req.session.loggedin = true;
        req.session.username = username;
        req.session.userID = row.id;
        res.redirect("/");
      } else {
        req.session.isadmin = false;
        req.session.loggedin = true;
        req.session.username = username;
        req.session.userID = row.id;
        res.redirect("/");
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
      }
    });
  }
});

router.get('/profile', function(req,res){
  let userID = req.session.userID;
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  sqlite.getUserDetails(userID, (err, row) => {
    if (err) {
      console.error(err);
      return res.redirect('/');
    } else {
      res.render('profile', {
        cartCount: cart.totalQty,
        name: req.session.username,
        username: row.username,
        email: row.email,
        pass: row.password,
        detailUpdateError: null,
        loginError: null,
        registerError: null,
        registerSuccess: null,
        admin: req.session.isadmin
      });
    }
  });
});

router.post('/update-profile', (req, res) => {
  let cart = new Cart(req.session.cart ? req.session.cart : {});
  let userID = req.session.userID;
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;

  sqlite.updateProfile(username, email, password, userID, (err, result) => {
    if (err) { 
      if (err.errno == 19) {
        sqlite.getUserDetails(userID, (errGetDetails, row) => {
          res.render('profile', {
            cartCount: cart.totalQty,
            name: req.session.username,
            username: row.username,
            email: row.email,
            pass: row.password,
            detailUpdateError: "Username is already taken",
            loginError: null,
            registerError: null,
            registerSuccess: null,
            admin: req.session.isadmin
          });
        });
      } else {
        sqlite.getUserDetails(userID, (errGetDetails, row) => {
          res.render('profile', {
            cartCount: cart.totalQty,
            name: req.session.username,
            username: row.username,
            email: row.email,
            pass: row.password,
            detailUpdateError: err,
            loginError: null,
            registerError: null,
            registerSuccess: null,
            admin: req.session.isadmin
          });
        });
      }
    } else {
      req.session.username = username;
      sqlite.getUserDetails(userID, (err, row) => {
        res.render('profile', {
          cartCount: cart.totalQty,
          name: req.session.username,
          username: row.username,
          email: row.email,
          pass: row.password,
          detailUpdateError: null,
          loginError: null,
          registerError: null,
          registerSuccess: null,
          admin: req.session.isadmin
        });
      });
    }
  });
});

module.exports = router;
