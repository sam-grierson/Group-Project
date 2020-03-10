const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const router = express.Router();

const Cart = require("../models/cart");
const Sqlite = require("../models/sqlite");

router.get("/", (req, res) => {  
  let sqlite = new Sqlite();
  let session = req.session
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  function getUser(session) {
    if (session.loggedin === true) {
      return req.session.username;
    } else {
      return false;
    }
  };

  sqlite.getProducts((err, products) => {
      res.render("index", {
      cartCount: cart.totalQty,
      name: getUser(session),
      products: products
    });
  });
});

router.get("/add-cart/:id", (req, res) => {
  let productId = req.params.id;
  let sqlite = new Sqlite();

  sqlite.addToCart(productId,(err, product) => {
    if (err) {
      res.redirect("/");
    } else {
      let cart = new Cart(req.session.cart ? req.session.cart : {});
      cart.add(product, product.id);
      req.session.cart = cart;
      res.redirect("/");
    }
  });
});

module.exports = router;
