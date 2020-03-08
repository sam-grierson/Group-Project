const express = require("express");
const router = express.Router();

const Cart = require("../models/cart")

router.get("/", (req, res) => {
  let cart = new Cart(req.session.cart ? req.session.cart : {});


  res.render("checkout", {
    cartCount: cart.totalQty,
    cartEmpty: cart.totalQty,
    loggedIn: req.session.loggedin,
  });
});

module.exports = router;