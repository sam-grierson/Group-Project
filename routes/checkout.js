const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const router = express.Router();

const Cart = require("../models/cart")

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
    name: getUser(session)
  });
});

module.exports = router;
