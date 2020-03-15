const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const router = express.Router();

const Cart = require("../models/cart");

router.get("/", (req, res) => {
  let session = req.session

  function getUser(session) {
    if (session.loggedin === true) {
      return req.session.username;
    } else {
      return false;
    }
  }

  if (!req.session.cart) {
    return res.render("cart", {
      cartCount: false,
      products: false,
      total: 0,
      name: getUser(session),
      logSucsess: true,
      admin: req.session.isadmin
    });
  }

  let cart = new Cart(req.session.cart)
  res.render("cart", {
    cartCount: cart.totalQty,
    products: cart.generateArray(),
    total: cart.totalPrice,
    name: getUser(session),
    logSucsess: true,
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
