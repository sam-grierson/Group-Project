const express = require("express");
const router = express.Router();

const validate = require("../lib/validate");
const insecurity = require("../lib/insecurity");
const Cart = require("../models/cart");
const sqlite = require("../models/sqlite");

router.get("/", (req, res) => {
  let userID = req.session.userID;
  let cart = new Cart(req.session.cart ? req.session.cart : {});
  
  sqlite.getUserDetails(userID, (err, userDetails) => {
    sqlite.getUserPaymentDetails(userID, (err, userPaymentDetails) => {
        sqlite.getOrderHistory(userID, (err, orders) => {
          res.render("profile", {
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
  
router.post("/update-profile", (req, res) => {
  let cart = new Cart(req.session.cart ? req.session.cart : {});
  let userID = req.session.userID;
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;

  let error = null;
  if (username === "") {
    error = "Missing required field: Username";
  } else if (email === "") {
    error = "Missing required field: Email";
  } else if (password === "") {
    error = "Missing required field: Password";
  } else if (validate.isEmail(email) === false) {
    error = "Invalid email address";
  } else {
    sqlite.getUserDetails(userID, (getUserDetailsError, userDetails) => {
      if (password === userDetails.password) {
      } else {
        password = insecurity.hash(password);     
      }
      sqlite.updateProfile(username, email, password, userID, (err, result) => {
      if (err) {
          if (err.errno == 19) {
            error = "Username is already taken";
          } else {
            error = err;          
          }
          sqlite.getUserDetails(userID, (getUserDetailsError, userDetails) => {
            sqlite.getUserPaymentDetails(userID, (getPaymentDetailsError, userPaymentDetails) => {
              sqlite.getOrderHistory(userID, (getOrderHistoryError, orders) => {
                res.render("profile", {
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
          res.redirect("/profile");
        }
      }); 
    });
  }
  if (error !== null) {
    sqlite.getUserDetails(userID, (getUserDetailsError, userDetails) => {
      sqlite.getUserPaymentDetails(userID, (getPaymentDetailsError, userPaymentDetails) => {
        sqlite.getOrderHistory(userID, (getOrderHistoryError, orders) => {
          res.render("profile", {
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
        return error = err;
      } else {
        return res.redirect("/profile");
      }
    });
  } else {
    sqlite.getUserDetails(userID, (userDetailsError, userDetails) => {
      sqlite.getUserPaymentDetails(userID, (userPaymentDetialsError, userPaymentDetails) => {
        sqlite.getOrderHistory(userID, (getOrderHistoryError, orders) => {
          res.render("profile", {
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
  }
});
  
module.exports = router;
