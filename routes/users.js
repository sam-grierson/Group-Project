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
        console.log("Bye");
      }
    });
  }
});

router.get('/profile', function(req,res){
  let sqlite = new Sqlite();
  let session = req.session;
  let cart = new Cart(req.session.cart ? req.session.cart : {});
  let userId = utils.getUser(session);

  sqlite.getUserDetails(userId, (err,row) => {
    if (err) {
      console.error(err);
      return res.redirect('/');
    } else {
      res.render('profile', {
        cartCount: cart.totalQty,
        products: cart.generateArray(),
        total: cart.totalPrice,
        name: utils.getUser(session),
        username: row.username,
        email: row.Email,
        pass: row.password,
        edit: false,
        loginError: null,
        registerError: null,
        registerSuccess: null,
        admin: req.session.isadmin
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
