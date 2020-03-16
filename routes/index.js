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
      products: products,
      logSucsess: true,
      admin: req.session.isadmin
    });
  });
});

router.post("/search", (req, res) => {
  let criteria = req.body.productname
  let session = req.session
  let cart = new Cart(req.session.cart ? req.session.cart : {});


 function getUser(session) {
   if (session.loggedin === true) {
     return req.session.username;
   } else {
     return false;
   }
 }

 sqlite.searchProduct(criteria , (err, result) => {
   if (err) {
     console.error(err);
     return res.redirect("/");
   } else {
     console.log(result)
     res.render("index",{
       cartCount: cart.totalQty,
       name: getUser(session),
       products: result,
       logSucsess: true,
       admin: req.session.isadmin
     });
   }
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
