const express = require("express");
const router = express.Router();

const Cart = require("../models/cart");
const Sqlite = require("../models/sqlite");
const sqlite = new Sqlite();

router.get("/", (req, res) => {
  let cart = new Cart(req.session.cart);
  let session = req.session;

  if (session.loggedin == true) {
    sqlite.getUserPaymentDetails(session.userID,(err, userPaymentDetails) => {
      res.render("checkout", {
        email: null,
        userPaymentDetails: userPaymentDetails,
        userCheckoutError: null,
        cartCount: cart.totalQty,
        cartEmpty: cart.totalQty,
        loggedIn: req.session.loggedin,
        total: cart.totalPrice,
        paymentSub: null,
        name: session.username,
        loginError: null,
        registerError: null,
        registerSuccess: null,
        admin: req.session.isadmin
      });
    });
  } else {
    res.render("checkout", {
      email: null,
      userPaymentDetails: null,
      userCheckoutError: null,
      cartCount: cart.totalQty,
      cartEmpty: cart.totalQty,
      loggedIn: req.session.loggedin,
      total: cart.totalPrice,
      paymentSub: null,
      name: false,
      loginError: null,
      registerError: null,
      registerSuccess: null,
      admin: req.session.isadmin
    });
  }
});

// logged in user checkout payments
router.post("/checkout-logged-in", (req, res) => {
  let cart = new Cart(req.session.cart);

  let name = req.body.userName;
  let phoneNo = req.body.userPhoneno;
  let address = req.body.userAddress;
  let cardName = req.body.userCardName;
  let cardNo = req.body.userCardNo;
  let expiration = req.body.userExpiration;
  let cvc = req.body.userCvc;

  let error = null;
  function checkError(error) {
    if (error === null) {
      return true;
    } else {
      return false;
    }
  };

  if (name && phoneNo && address && cardName && cardNo && expiration && cvc) {
    products = cart.generateArray();
    for (let i = 0; i < products.length; i++) {
      sqlite.insertOrder(name, phoneNo, address, cardName, cardNo, expiration, cart.totalPrice, products[i].item.id, products[i].qty, req.session.userID, (err, result) => {
        if (err) {
          error = err;
        } else {
          cart.clearCart();
          req.session.cart = cart;
        };
      });
    }
  } else {
    error = "Please fill out all the fields in the payment details form."
  }
  sqlite.getUserDetails(req.session.userID, (getUserDetailsError, userDetails) => {
    sqlite.getUserPaymentDetails(req.session.userID,(getUserPaymentDetailsError, userPaymentDetails) => {
      res.render("checkout", {
        email: userDetails.email,
        userPaymentDetails: userPaymentDetails,
        userCheckoutError: error,
        cartCount: cart.totalQty,
        cartEmpty: cart.totalQty,
        loggedIn: req.session.loggedin,
        total: cart.totalPrice,
        paymentSub: checkError(error),
        name: req.session.username,
        loginError: null,
        registerError: null,
        registerSuccess: null,
        admin: req.session.isadmin
      });
    });
  });
});

// Guest checkout payments
router.post("/checkout-guest", (req, res) => {
  let cart = new Cart(req.session.cart);

  let firstName = req.body.firstname;
  let surname = req.body.secondname;
  let email = req.body.email;
  let phoneNo = req.body.phoneno;
  let address = req.body.address;
  let cardName = req.body.firstname;
  let cardNo = req.body.firstname;
  let expMon = req.body.expmon;
  let expYr = req.body.expyr;

  // need to add input validation

  cart.clearCart();
  req.session.cart = cart;

  res.render("checkout", {
    email: email,
    userPaymentDetails: null,
    userCheckoutError: null,
    cartCount: cart.totalQty,
    cartEmpty: cart.totalQty,
    loggedIn: req.session.loggedin,
    total: cart.totalPrice,
    paymentSub: true,
    name: null,
    loginError: null,
    registerError: null,
    registerSuccess: null,
    admin: req.session.isadmin
  });
});

router.get("/cancel", (req, res) => {
  res.redirect("/cart")
});

module.exports = router;
