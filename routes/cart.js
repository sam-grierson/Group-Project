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

router.get("/remove-cart/:id", (req, res) => {
  let productId = req.params.id;
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect("back")
});

router.get("/empty-cart", (req, res) => {
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.clearCart();
  req.session.cart = cart;
  res.redirect("back")
});

module.exports = router;