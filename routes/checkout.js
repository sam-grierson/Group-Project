const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const router = express.Router();

const Cart = require("../models/cart")

router.get("/", (req, res) => {
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  res.render("checkout", {
    cartCount: cart.totalQty,
    cartEmpty: cart.totalQty,
    loggedIn: req.session.loggedin,
    total: cart.totalPrice,
    paymentSub: null
  });
});

// let db = new sqlite3.Database("db/database.db");
// let sql = `INSERT INTO user(username,firstname,surname,email,phoneNo,address,cardName,cardNo,expMon,expYr) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`
// db.run(sql, [username,firstName,surname,email,phoneNo,address,cardName,cardNo,expMon,expYr], (err) => {
//   if (err) {
//     return console.error(err.message);
//   }
// });

// Guest checkout payments go into the void
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
    cartCount: cart.totalQty,
    cartEmpty: cart.totalQty,
    loggedIn: req.session.loggedin,
    total: cart.totalPrice,
    paymentSub: "Payment Successful!"
  });
});

module.exports = router;