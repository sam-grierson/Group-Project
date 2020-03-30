const express = require("express");
const router = express.Router();

const Cart = require("../models/cart");
const sqlite = require("../models/sqlite");
const validate = require("../lib/validate")

router.get("/", (req, res) => {
  let cart = new Cart(req.session.cart);
  let session = req.session;

  if (session.loggedin == true) {
    sqlite.getUserPaymentDetails(session.userID,(err, userPaymentDetails) => {
      res.render("checkout", {
        email: null,
        userPaymentDetails: userPaymentDetails,
        userCheckoutError: null,
        guestCheckoutError: null,
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
      guestCheckoutError: null,
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
  } else if (name && phoneNo && address && cardName && cardNo && expiration && cvc) {
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
    error = "Please fill out all the fields in the payment details form"
  }
  sqlite.getUserDetails(req.session.userID, (getUserDetailsError, userDetails) => {
    sqlite.getUserPaymentDetails(req.session.userID,(getUserPaymentDetailsError, userPaymentDetails) => {
      res.render("checkout", {
        email: userDetails.email,
        userPaymentDetails: userPaymentDetails,
        userCheckoutError: error,
        guestCheckoutError: null,
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
  let cvc = req.body.cvc;
  let error = null;

  function checkError(error) {
    if (error === null) {
      return true;
    } else {
      return false;
    }
  };

  if (firstName === "") {
    firstName = null;
  } else if (surname === "") {
      surname = null;
  } else if (validate.isPhoneNumber(phoneNo) === false) {
    error = "Invalid phone number";
  } else if (validate.isEmail(email) === false) {
    error = "Invalid email address"; 
  } else if (address === "") {
    address = null;
  } else if (cardName === "") {
    cardName = null;
  } else if (validate.isVisaCard(cardNo) === false && validate.isMasterCard(cardNo) === false) {
    error = "Invalid Payment information: This site only accepts Visa or Master card";
  } else if (validate.isMonth(expMon) === false && validate.isYear(expYr) === false) {
    error = "Invalid Payment information: Invalid expiration";
  } else if (validate.isCvc(cvc) === false) {
    error = "Invalid Payment information: Invalid CVC";
  } else if (name && phoneNo && address && cardName && cardNo && expiration && cvc) {    
    cart.clearCart();
    req.session.cart = cart;
  } else {
    error = "Please fill out all the fields in the payment details form.";
  }
  res.render("checkout", {
    email: email,
    userPaymentDetails: null,
    userCheckoutError: null,
    guestCheckoutError: error,
    cartCount: cart.totalQty,
    cartEmpty: cart.totalQty,
    loggedIn: req.session.loggedin,
    total: cart.totalPrice,
    paymentSub: checkError(error),
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
