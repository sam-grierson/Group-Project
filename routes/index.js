const express = require("express");
const router = express.Router();

const Cart = require("../models/cart");
const Sqlite = require("../models/sqlite");
const sqlite = new Sqlite();

router.get("/", (req, res) => {  
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

router.post("/search", (req, res) => { // function  for searching database
  let db = new sqlite3.Database("db/database.db");
  let productId = req.body.productname
  let sql = `SELECT * from products WHERE title = '${productId}'`; // this makes the query vounerable to sql injections
  let session = req.session
  let cart = new Cart(req.session.cart ? req.session.cart : {});
  console.log(sql)

 function getUser(session) { //needed for compatibility with render index
   if (session.loggedin === true) {
     return req.session.username;
   } else {
     return false;
   }
 }

 db.all(sql , (err, products) => {
   if (err) {
     console.error(err);
     return res.redirect("/");
   }else{
     res.render("index",{ // unable to get the additional tables to show up
       cartCount: cart.totalQty,
       name: getUser(session),
       products: products
     });
   }
 });
});

router.get("/add-cart/:id", (req, res) => {
  let productId = req.params.id;

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
