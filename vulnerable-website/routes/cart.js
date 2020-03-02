const express = require("express");
const router = express.Router();

const Cart = require("../models/cart");

router.get("/", (req, res) => {
  if (!req.session.cart) {
    return res.render("cart", {
      products: false,
      total: false
    });
  }

  let cart = new Cart(req.session.cart)
  res.render("cart", {
    products: cart.generateArray(),
    total: cart.totalPrice
  });
});

module.exports = router;