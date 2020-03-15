const express = require("express");
const router = express.Router();

const Cart = require("../models/cart");
const Sqlite = require("../models/sqlite");
const sqlite = new Sqlite();

router.get("/", (req, res) => {
  let cart = new Cart(req.session.cart);
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
        cvc: userDetails.cvc,
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
      cvc: null,
      cartCount: cart.totalQty,
      cartEmpty: cart.totalQty,
      loggedIn: req.session.loggedin,
      total: cart.totalPrice,
      paymentSub: null,
      name: false
    });
  }
});

// logged in user checkout payments
router.post("/checkout-logged-in", (req, res) => {
  let cart = new Cart(req.session.cart);

  let name = req.body.userName;
  let email = req.body.userEmail;
  let phoneNo = req.body.userPhoneno;
  let address = req.body.userAddress;
  let cardName = req.body.userCardName;
  let cardNo = req.body.userCardNo;
  let expiration = req.body.userExpiration;
  let cvc = req.body.userCvc;

  // need to add input validation

  if (name && email && phoneNo && address && cardName && cardNo && expiration && cvc) {
    products = cart.generateArray();
    for (let i = 0; i < products.length; i++) {
      console.log(products[i].item.id);
      console.log(products[i].qty);
      sqlite.insertOrder(name, phoneNo, address, cardName, cardNo, expiration, cart.totalPrice, products[i].qty, products[i].item.id, req.session.userID, (err, result) => {
        if (err) {
          console.error(err);
        } else {
          cart.clearCart();
          req.session.cart = cart;    
          
          res.render("checkout", {
            nameDetails: name,
            email: email,
            phoneNo: phoneNo,
            address: address,
            cardName: cardName,
            cardNo: cardNo,
            expiration: expiration,
            cvc: cvc,
            cartCount: cart.totalQty,
            cartEmpty: cart.totalQty,
            loggedIn: req.session.loggedin,
            total: cart.totalPrice,
            paymentSub: result,
            name: req.session.username
          });
        }
      });
    }    
  } else {
    console.log("fill all inputs");
    res.redirect("/checkout");
  }
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
    firstName: null,
    secondName: null,
    phoneNo: null,
    address: null,
    cardName: null,
    cardNo: null,
    expiration: null,
    cartCount: cart.totalQty,
    cartEmpty: cart.totalQty,
    loggedIn: req.session.loggedin,
    total: cart.totalPrice,
    paymentSub: true,
    name: null,
    email: email
  });
});

router.get("/cancel", (req, res) => {
  res.redirect("/cart")
});

module.exports = router;
