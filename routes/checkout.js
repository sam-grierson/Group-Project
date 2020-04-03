const express = require("express");
const router = express.Router();

const Cart = require("../models/cart");
const sqlite = require("../models/sqlite");
const validate = require("../lib/validate");
const insecurity = require("../lib/insecurity");
const utils = require("../lib/utils");

router.get("/", (req, res) => {
  let cart = new Cart(req.cookies.cart);

  if (req.cookies.token) {
    let token = insecurity.verify(req.cookies.token);
    sqlite.getUserPaymentDetails(token.userID, (getUserPaymentDetailsError, userPaymentDetails) => {
      res.render("checkout", {
        email: null,
        userPaymentDetails: userPaymentDetails,
        userCheckoutError: null,
        guestCheckoutError: null,
        cartCount: cart.totalQty,
        cartEmpty: cart.totalQty,
        loggedIn: true,
        total: cart.totalPrice,
        paymentSub: null,
        name: token.username,
        loginError: null,
        registerError: null,
        registerSuccess: null,
        admin: token.isAdmin
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
      loggedIn: null,
      total: cart.totalPrice,
      paymentSub: null,
      name: null,
      loginError: null,
      registerError: null,
      registerSuccess: null,
      admin: utils.getAdmin(req.cookies)
    });
  }
});

// logged in user checkout payments
router.post("/checkout-logged-in", (req, res, next) => {
  let cart = new Cart(req.cookies.cart);
  let token = insecurity.verify(req.cookies.token);

  let name = req.body.userName;
  let phoneNo = req.body.userPhoneno;
  let address = req.body.userAddress;
  let cardName = req.body.userCardName;
  let cardNo = req.body.userCardNo;
  let expiration = req.body.userExpiration;
  let cvc = req.body.userCvc;
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
  } else if (name && phoneNo && address && cardName && cardNo && expiration && cvc) {
    products = cart.generateArray();
    for (let i = 0; i < products.length; i++) {
      sqlite.insertOrder(name, phoneNo, address, cardName, cardNo, expiration, cart.totalPrice, products[i].item.id, products[i].qty, token.userID, (err, result) => {
        if (err) {
          error = err;
        }
      });
    }
    cart.clearCart();
    res.cookie("cart", cart, { maxAge: 7200000 });
  } else {
    error = "Please fill out all the fields in the payment details form"
  }
  sqlite.getUserDetails(token.userID, (getUserDetailsError, userDetails) => {
    sqlite.getUserPaymentDetails(token.userID,(getUserPaymentDetailsError, userPaymentDetails) => {
      res.render("checkout", {
        email: userDetails.email,
        userPaymentDetails: userPaymentDetails,
        userCheckoutError: error,
        guestCheckoutError: null,
        cartCount: cart.totalQty,
        cartEmpty: cart.totalQty,
        loggedIn: true,
        total: cart.totalPrice,
        paymentSub: utils.checkError(error),
        name: token.username,
        loginError: null,
        registerError: null,
        registerSuccess: null,
        admin: token.isAdmin
      });
    });
  });
});

// Guest checkout payments
router.post("/checkout-guest", (req, res) => {
  let cart = new Cart(req.cookies.cart);

  let firstName = req.body.firstname;
  let surname = req.body.secondname;
  let email = req.body.email;
  let phoneNo = req.body.phoneno;
  let address = req.body.address;
  let cardName = req.body.cardname;
  let cardNo = req.body.cardno;
  let expMon = req.body.expmon;
  let expYr = req.body.expyr;
  let cvc = req.body.cvc;
  let error = null;

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
  } else if (validate.isExpiration(expMon + "/" + expYr) === false ) {
    error = "Invalid Payment information: Invalid expiration";
  } else if (validate.isCvc(cvc) === false) {
    error = "Invalid Payment information: Invalid CVC";
  } else if (firstName && surname && email && phoneNo && address && cardName && cardNo && expMon && expYr && cvc) {    
    cart.clearCart();
    res.cookie("cart", cart, { maxAge: 7200000 });
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
    loggedIn: null,
    total: cart.totalPrice,
    paymentSub: utils.checkError(error),
    name: null,
    loginError: null,
    registerError: null,
    registerSuccess: null,
    admin: utils.getAdmin(req.cookies)
  });
});

router.get("/cancel", (req, res) => {
  res.redirect("/cart")
});

module.exports = router;
