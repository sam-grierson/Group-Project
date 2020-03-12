const express = require("express");
const router = express.Router();

const Cart = require("../models/cart");
const Sqlite = require("../models/sqlite");

router.get("/", (req, res) => {
  let sqlite = new Sqlite();
  let cart = new Cart(req.session.cart ? req.session.cart : {});
  let session = req.session;

  if (session.loggedin == true) {
    sqlite.getUserDetails(session.username,(err, userDetails) => {

      res.render("checkout", {
        nameDetails: userDetails.name,
        email: userDetails.Email,
        phoneNo: userDetails.phoneNo,
        address: userDetails.address,
        cardName: userDetails.cardName,
        cardNo: userDetails.cardNo,
        expiration: userDetails.expiry,
        cartCount: cart.totalQty,
        cartEmpty: cart.totalQty,
        loggedIn: req.session.loggedin,
        total: cart.totalPrice,
        paymentSub: null,
        name: session.username
      });
    });
  } else {
    res.render("checkout", {
      nameDetails: null,
      email: null,
      phoneNo: null,
      address: null,
      cardName: null,
      cardNo: null,
      expiration: null,
      cartCount: cart.totalQty,
      cartEmpty: cart.totalQty,
      loggedIn: req.session.loggedin,
      total: cart.totalPrice,
      paymentSub: null,
      name: false
    });
  }
});

// Guest checkout payments
router.post("/", (req, res) => {
  let cart = new Cart(req.session.cart ? req.session.cart : {});

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

  cart.clearCart()
  req.session.cart = cart

  res.render("checkout", {
    firstName: null,
    secondName: null,
    email: null,
    phoneNo: null,
    address: null,
    cardName: null,
    cardNo: null,
    expiration,
    cartCount: cart.totalQty,
    cartEmpty: cart.totalQty,
    loggedIn: req.session.loggedin,
    total: cart.totalPrice,
    paymentSub: true,
    name: null,
    email: email
  });
});

module.exports = router;
