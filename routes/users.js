const express = require("express");
const router = express.Router();

const utils = require("../lib/utils");
const validate = require("../lib/validate");
const insecurity = require("../lib/insecurity");
const Cart = require("../models/cart");
const Sqlite = require("../models/sqlite");
const sqlite = new Sqlite();

// register route
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
            return error = "Username has already been taken.";
          } else {
            return error = err;
          }
        }
      });
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
  }
});

// login route
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

router.get('/profile', (req, res) => {
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

  let error = null;
  if (username === "") {
    error = "Missing required field: Username"
  } else if (email === "") {
    error = "Missing required field: Email"
  } else if (password === "") {
    error = "Missing required field: Password"
  } else if (validate.isEmail(email) === false) {
    error = "Invalid email address";
  } else {
    sqlite.updateProfile(username, email, insecurity.hash(password), userID, (err, result) => {
      if (err) {
        if (err.errno == 19) {
          error = "Username is already taken";
        } else {
          error = err
        }
      }
    });
  }
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
  let error = null;

  if (name === "") {
    name = null;
  } else if (validate.isPhoneNumber(phoneNo) === false) {
    error = "Invalid Phone Number";
  } else if (address === "") {
    address = null;
  } else if (cardName === "") {
    cardName = null;
  } else if (validate.isVisaCard(cardNo) === false && validate.isMasterCard(cardNo) === false) {
    error = "Invalid Payment information: This site only accepts Visa or Master card";
  } else if (validate.isCvc(cvc) === false) {
    error = "Invalid Payment information: Invalid CVC";
  } else if (validate.isExpiration(expiration) === false) {
    error = "Invalid Payment information: Invalid expiration (please use the format MM/YY)";
  } 

  if (error === null) {
    sqlite.updatePaymentDetails(name, phoneNo, address, cardName, cardNo, expiration, cvc, userID, (err, result) => {
      if (err) {
        error = err;
      }
    });
  }
  sqlite.getUserDetails(userID, (userDetailsError, userDetails) => {
    sqlite.getUserPaymentDetails(userID, (userPaymentDetialsError, userPaymentDetails) => {
      sqlite.getOrderHistory(userID, (getOrderHistoryError, orders) => {
        res.render('profile', {
          cartCount: cart.totalQty,
          name: req.session.username,
          userDetails: userDetails,
          detailUpdateError: null,
          userPaymentDetails: userPaymentDetails,
          paymentUpdateError: error,
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

module.exports = router;
