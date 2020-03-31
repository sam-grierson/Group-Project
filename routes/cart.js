const express = require("express");
const router = express.Router();

const utils = require("../lib/utils")
const Cart = require("../models/cart");

router.get("/", (req, res) => {

  if (!req.cookies.cart) {
    return res.render("cart", {
      cartCount: false,
      products: false,
      total: 0,
      name: utils.getUser(req.cookies),
      loginError: null,
      registerError: null,
      registerSuccess: null,
      admin: utils.getAdmin(req.cookies)
    });
  }

  let cart = new Cart(req.cookies.cart)
  res.render("cart", {
    cartCount: cart.totalQty,
    products: cart.generateArray(),
    total: cart.totalPrice,
    name: utils.getUser(req.cookies),
    loginError: null,
    registerError: null,
    registerSuccess: null,
    admin: utils.getAdmin(req.cookies)
  });
});

router.get("/remove-cart/:id", (req, res) => {
  let productId = req.params.id;
  let cart = new Cart(req.cookies.cart ? req.cookies.cart : {});

  cart.removeItem(productId);
  res.cookie("cart", cart, { expiresIn: 3600 * 5 });
  res.redirect("/cart")
});

router.get("/empty-cart", (req, res) => {
  let cart = new Cart(req.cookies.cart ? req.cookies.cart : {});

  cart.clearCart();
  res.cookie("cart", cart, { expiresIn: 3600 * 5 });
  res.redirect("/cart")
});

module.exports = router;
