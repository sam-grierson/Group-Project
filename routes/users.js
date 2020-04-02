const express = require("express");
const router = express.Router();

const utils = require("../lib/utils");
const validate = require("../lib/validate");
const insecurity = require("../lib/insecurity");
const Cart = require("../models/cart");
const sqlite = require("../models/sqlite");

router.post("/register", (req, res, next) => {
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let passwordTwo = req.body.passwordTwo;
  let cart = new Cart(req.cookies.cart ? req.cookies.cart : {});

  let error = null;

  if (username && email && password && passwordTwo) {
    if (password !== passwordTwo) {
      error = "Passwords don't match";
    } else if (validate.isEmail(email) === false) {
      error = "Invalid email address";
    } else {
      sqlite.registerUser(username, insecurity.hash(password), email, (err, result) => {
        if (err) {
          if (err.errno == 19) {
            error = "Username has already been taken.";
          } else {
            error = err;
          }
        }
        sqlite.getProducts((productsErr, products) => {
          res.render("index", {
            cartCount: cart.totalQty,
            name: utils.getUser(req.cookies),
            products: products,
            loginError: null,
            registerError: error,
            registerSuccess: utils.checkError(error),
            admin: utils.getAdmin(req.cookies),
            searched: null
          });
        });
      });
    }
    if (error !== null) {
      sqlite.getProducts((productsErr, products) => {
        res.render("index", {
          cartCount: cart.totalQty,
          name: utils.getUser(req.cookies),
          products: products,
          loginError: null,
          registerError: error,
          registerSuccess: utils.checkError(error),
          admin: utils.getAdmin(req.cookies),
          searched: null
        });
      });
    }
  }
});

router.post("/login", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let cart = new Cart(req.cookies.cart ? req.cookies.cart : {});

  if (username && password) {
    sqlite.loginUser(username, insecurity.hash(password), (err, row) => {
      if (err) {
        sqlite.getProducts((productErr, products) => {
          res.render("index", {
            cartCount: cart.totalQty,
            name: utils.getUser(req.cookies),
            products: products,
            loginError: err,
            registerError: null,
            registerSuccess: null,
            admin: utils.getAdmin(req.cookies),
            searched: null
          });
        });
      } else if (!row) {
        sqlite.getProducts((err, products) => {
          res.render("index", {
            cartCount: cart.totalQty,
            name: utils.getUser(req.cookies),
            products: products,
            loginError: "Invalid username/password.",
            registerError: null,
            registerSuccess: null,
            admin: utils.getAdmin(req.cookies),
            searched: null
          });
        });
      } else if (row.username == "Admin") {
        token = insecurity.authorize({ userID: row.id, username: row.username, isAdmin: true });
        res.cookie("token", token, {maxAge: 3600 * 5 });
        res.redirect("/");
      } else {
        token = insecurity.authorize({ userID: row.id, username: row.username, isAdmin: false });
        res.cookie("token", token, {maxAge: 3600 * 5 });
        res.redirect("/");
      }
    });
  }
});

router.get("/logout", (req, res) => {
  if (req.cookies) {
    res.clearCookie("token");
    res.redirect("/");
  }
});

module.exports = router;
