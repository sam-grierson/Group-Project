const express = require("express");
const router = express.Router();

const utils = require("../lib/utils")
const Cart = require("../models/cart");

router.get("/", (req, res) => {
  let session = req.session

  if (!req.session.cart) {
    return res.render("cart", {
      cartCount: false,
      products: false,
      total: 0,
      name: utils.getUser(session),
      loginError: null,
      registerError: null,
      registerSuccess: null,
      admin: req.session.isadmin
    });
  }

  let cart = new Cart(req.session.cart)
  res.render("cart", {
    cartCount: cart.totalQty,
    products: cart.generateArray(),
    total: cart.totalPrice,
    name: utils.getUser(session),
    loginError: null,
    registerError: null,
    registerSuccess: null,
    admin: req.session.isadmin
  });
});

router.get("/remove-cart/:id", (req, res) => {
  let productId = req.params.id;
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect("/cart")
});

router.get("/empty-cart", (req, res) => {
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.clearCart();
  req.session.cart = cart;
  res.redirect("/cart")
});

module.exports = router;
