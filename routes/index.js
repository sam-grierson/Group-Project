const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

const Cart = require("../models/cart");
const Sqlite = require("../models/sqlite");
const utils = require("../lib/utils")
const sqlite = new Sqlite();

router.get("/", (req, res) => {
  let session = req.session
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  sqlite.getProducts((err, products) => {
      res.render("index", {
      cartCount: cart.totalQty,
      name: utils.getUser(session),
      products: products,
      loginError: null,
      registerError:null,
      registerSuccess: null,
      admin: req.session.isadmin,
      searched: null
    });
  });
});

router.post("/search", (req, res) => {
  let criteria = req.body.productname
  let session = req.session
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  sqlite.searchProduct(criteria, (err, result) => {
    if (err) {
      console.error(err);
      res.render("index",{
        cartCount: cart.totalQty,
        name: utils.getUser(session),
        products: [],
        loginError: null,
        registerError: null,
        registerSuccess: null,
        admin: req.session.isadmin,
        searched: criteria
      });
    } else {
      res.render("index",{
        cartCount: cart.totalQty,
        name: utils.getUser(session),
        products: result,
        loginError: null,
        registerError: null,
        registerSuccess: null,
        admin: req.session.isadmin,
        searched: criteria
      });
    }
  });
});

router.get("/add-cart/:id", (req, res) => {
  let productId = req.params.id;

  sqlite.addToCart(productId, (err, product) => {
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

router.get("/removeItem/:id", (req, res) => {
  let productId = req.params.id;

  sqlite.removeItem(productId, (err, product) => {
    if (err) {
      res.redirect("/");
    } else {
      res.redirect("/");
    }
  });
});

router.get("/addItem", (req, res) => {
  let session = req.session
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  res.render('addItem', {
    cartCount: cart.totalQty,
    name: utils.getUser(session),
    loginError: null,
    registerError: null,
    registerSuccess: null,
    admin: req.session.isadmin,
    itemAdded: false
  });
});

router.post("/addItem", (req, res) => {
  let session = req.session
  let cart = new Cart(req.session.cart ? req.session.cart : {});

  let title = req.body.title;
  let price = req.body.price;
  let image = 'assets/' + req.body.image + '.jpg';
  let stock = req.body.stock;

  sqlite.addItem(title,price,image,stock, (err) => {

    res.render('addItem', {
      cartCount: cart.totalQty,
      name: utils.getUser(session),
      loginError: null,
      registerError: null,
      registerSuccess: null,
      admin: req.session.isadmin,
      itemAdded: true
    });
  });
});

router.post('/send', function(req, res) {
  const output = `
  You have a new message From

  Name: ${req.body.Name}
  Email: ${req.body.Email}
  Subject: ${req.body.Subject}

  Message: ${req.body.Message}
  `;

  async function main() {
    let testAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass // generated ethereal password
      }
    });

    let info = await transporter.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>', // sender address
      to: "bar@example.com, baz@example.com", // list of receivers
      subject: "Issue", // Subject line
      text: output
    });

    console.log("Message sent: %s", info.messageId);

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    /*let mailOptions = {
      from: 'grouprojectpen@gmail.com',
      to: 'grouprojectpen@gmail.com',
      subject: 'Issue',
      text: output
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });*/
  }

  main().catch(console.error);



  res.redirect('/');
});

module.exports = router;
