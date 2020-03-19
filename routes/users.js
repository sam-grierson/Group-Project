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

  sqlite.getUserDetails(userID, (err, userDetails) => {
    sqlite.getUserPaymentDetails(userID, (err, userPaymentDetails) => {
      sqlite.getOrderHistory(userID, (err, orders) => {
        res.render('profile', {
          cartCount: cart.totalQty,
          name: req.session.username,
          userDetails: userDetails,
          detailUpdateError: null,
          userPaymentDetails: userPaymentDetails,
          paymentUpdateError: null,
          loginError: null,
          registerError: null,
          registerSuccess: null,
          admin: req.session.isadmin,
          orderHistory: orders
        });
      });
    });
  });
});

router.post('/update-profile', (req, res) => {
  let cart = new Cart(req.session.cart ? req.session.cart : {});
  let userID = req.session.userID;
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;

  if (username === "") {
    error = "Missing required field: Username"
    sqlite.getUserDetails(userID, (err, userDetails) => {
      sqlite.getUserPaymentDetails(userID, (err, userPaymentDetails) => {
        sqlite.getOrderHistory(userID, (err, orders) => {
          res.render('profile', {
            cartCount: cart.totalQty,
            name: req.session.username,
            userDetails: userDetails,
            detailUpdateError: error,
            userPaymentDetails: userPaymentDetails,
            paymentUpdateError: null,
            loginError: null,
            registerError: null,
            registerSuccess: null,
            admin: req.session.isadmin,
            orderHistory: orders
          });
        });
      });
    });
  } else if (email === "") {
    error = "Missing required field: Email"
    sqlite.getUserDetails(userID, (err, userDetails) => {
      sqlite.getUserPaymentDetails(userID, (err, userPaymentDetails) => {
        sqlite.getOrderHistory(userID, (err, orders) => {
          res.render('profile', {
            cartCount: cart.totalQty,
            name: req.session.username,
            userDetails: userDetails,
            detailUpdateError: error,
            userPaymentDetails: userPaymentDetails,
            paymentUpdateError: null,
            loginError: null,
            registerError: null,
            registerSuccess: null,
            admin: req.session.isadmin,
            orderHistory: orders
          });
        });
      });
    });
  } else if (password === "") {
    error = "Missing required field: Password"
    sqlite.getUserDetails(userID, (err, userDetails) => {
      sqlite.getUserPaymentDetails(userID, (err, userPaymentDetails) => {
        sqlite.getOrderHistory(userID, (err, orders) => {
          res.render('profile', {
            cartCount: cart.totalQty,
            name: req.session.username,
            userDetails: userDetails,
            detailUpdateError: error,
            userPaymentDetails: userPaymentDetails,
            paymentUpdateError: null,
            loginError: null,
            registerError: null,
            registerSuccess: null,
            admin: req.session.isadmin,
            orderHistory: orders
          });
        });
      });
    });
  } else {
    sqlite.updateProfile(username, email, password, userID, (err, result) => {
      sqlite.getUserPaymentDetails(userID, (err, userPaymentDetails) => {
        sqlite.getOrderHistory(userID, (err, orders) => {
          if (err) {
            if (err.errno == 19) {
              sqlite.getUserDetails(userID, (errGetDetails, userDetails) => {
                res.render('profile', {
                  cartCount: cart.totalQty,
                  name: req.session.username,
                  userDetails: userDetails,
                  detailUpdateError: "Username is already taken",
                  userPaymentDetails: userPaymentDetails,
                  paymentUpdateError: null,
                  loginError: null,
                  registerError: null,
                  registerSuccess: null,
                  admin: req.session.isadmin,
                  orderHistory: orders
                });
              });
            } else {
              sqlite.getUserDetails(userID, (errGetDetails, userDetails) => {
                res.render('profile', {
                  cartCount: cart.totalQty,
                  name: req.session.username,
                  userDetails: userDetails,
                  detailUpdateError: err,
                  userPaymentDetails: userPaymentDetails,
                  paymentUpdateError: null,
                  loginError: null,
                  registerError: null,
                  registerSuccess: null,
                  admin: req.session.isadmin,
                  orderHistory: orders
                });
              });
            }
          } else {
            sqlite.getUserDetails(userID, (err, userDetails) => {
              res.render('profile', {
                cartCount: cart.totalQty,
                name: req.session.username,
                userDetails: userDetails,
                detailUpdateError: null,
                userPaymentDetails: userPaymentDetails,
                paymentUpdateError: null,
                loginError: null,
                registerError: null,
                registerSuccess: null,
                admin: req.session.isadmin,
                orderHistory: orders
              });
            });
          }
        });
      });
    });
  }
});

router.post("/update-payment", (req, res) => {
  let cart = new Cart(req.session.cart ? req.session.cart : {});
  let userID = req.session.userID;
  let name = req.body.name;
  let phoneNo = req.body.phoneNo;
  let address = req.body.address;
  let cardName = req.body.cardName;
  let cardNo = req.body.cardNo;
  let expiration = req.body.expiration;
  let cvc = req.body.cvc;

  if (name === "") {
    name = null;
  } else if (phoneNo === "") {
    phoneNo = null;
  } else if (address === "") {
    address = null;
  } else if (cardName === "") {
    cardName = null;
  } else if (cardNo === "") {
    cardNo = null;
  } else if (expiration === "") {
    expiration = null;
  } else if (cvc === "") {
    cvc = null;
  }

  sqlite.updatePaymentDetails(name, phoneNo, address, cardName, cardNo, expiration, cvc, userID, (err, result) => {
    if (err) {
      sqlite.getUserDetails(userID, (userDetailsError, userDetails) => {
        sqlite.getUserPaymentDetails(userID, (userPaymentDetialsError, userPaymentDetails) => {
          sqlite.getOrderHistory(userID, (err, orders) => {
            res.render('profile', {
              cartCount: cart.totalQty,
              name: req.session.username,
              userDetails: userDetails,
              detailUpdateError: null,
              userPaymentDetails: userPaymentDetails,
              paymentUpdateError: err,
              loginError: null,
              registerError: null,
              registerSuccess: null,
              admin: req.session.isadmin,
              orderHistory: orders
            });
          });
        });
      });
    } else {
      res.redirect("/users/profile");
    }
  });
});

module.exports = router;
