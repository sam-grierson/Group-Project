const express = require("express");
const router = express.Router();

const Cart = require("../models/cart");
const Sqlite = require("../models/sqlite");

router.get("/", (req, res) => {
  let cart = new Cart(req.session.cart ? req.session.cart : {});
  let session = req.session

  function getUser(session) {
    if (session.loggedin === true) {
      return req.session.username;
    } else {
      return false;
    }
  }

  res.render("checkout", {
    cartCount: cart.totalQty,
    cartEmpty: cart.totalQty,
    loggedIn: req.session.loggedin,
    total: cart.totalPrice,
    paymentSub: null,
    name: getUser(session),
    logSucsess: true
  });
});

// User checkout payments
// let db = new sqlite3.Database("db/database.db");
// let sql = `INSERT INTO user(username,firstname,surname,email,phoneNo,address,cardName,cardNo,expMon,expYr) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`
// db.run(sql, [username,firstName,surname,email,phoneNo,address,cardName,cardNo,expMon,expYr], (err) => {
//   if (err) {
//     return console.error(err.message);
//   }
// });

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
