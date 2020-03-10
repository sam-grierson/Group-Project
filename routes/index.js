const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const router = express.Router();

const Cart = require("../models/cart")

router.get("/", (req, res) => {
  let db = new sqlite3.Database("db/database.db"); // path could become an issue when run on windows?
  let sql = `SELECT * FROM products`;
  let session = req.session
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  function getUser(session) {
    if (session.loggedin === true) {
      return req.session.username;
    } else {
      return false;
    }
  }

  db.all(sql, (err, products) => {
    if (err) {
      console.error(err);
    } else {
      res.render("index", {
        cartCount: cart.totalQty,
        name: getUser(session),
        products: products
      });
    }
  });

  db.close((err) => {
    if (err) {
      return console.error(err.message)
    }
  })
});

router.get("/add-cart/:id", (req, res) => {
  let db = new sqlite3.Database("db/database.db");
  let sql = `SELECT * FROM products WHERE id = ?`;
  let productId = req.params.id;

  db.get(sql, [productId], (err, product) => {
    if (err) {
      console.error(err);
      return res.redirect("/");
    } else {
      let cart = new Cart(req.session.cart ? req.session.cart : {});
      cart.add(product, product.id);
      req.session.cart = cart;
      res.redirect("/");
    }
  });
});

module.exports = router;
