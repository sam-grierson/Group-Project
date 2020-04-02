const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

const Cart = require("../models/cart");
const sqlite = require("../models/sqlite");
const utils = require("../lib/utils")


router.get("/", (req, res) => {
  let cart = new Cart(req.cookies.cart ? req.cookies.cart : {});
  console.log(req.cookies);
  sqlite.getProducts((err, products) => {
      res.render("index", {
      cartCount: cart.totalQty,
      name: utils.getUser(req.cookies),
      products: products,
      loginError: null,
      registerError:null,
      registerSuccess: null,
      admin: utils.getAdmin(req.cookies),
      searched: null
    });
  });
});

router.post("/search", (req, res) => {
  let criteria = req.body.productname
  let cart = new Cart(req.cookies.cart ? req.cookies.cart : {});

  sqlite.searchProduct(criteria, (err, result) => {
    if (err) {
      console.error(err);
      res.render("index",{
        cartCount: cart.totalQty,
        name: utils.getUser(req.cookies),
        products: [],
        loginError: null,
        registerError: null,
        registerSuccess: null,
        admin: utils.getAdmin(req.cookies),
        searched: criteria
      });
    } else {
      res.render("index",{
        cartCount: cart.totalQty,
        name: utils.getUser(req.cookies),
        products: result,
        loginError: null,
        registerError: null,
        registerSuccess: null,
        admin: utils.getAdmin(req.cookies),
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
      let cart = new Cart(req.cookies.cart ? req.cookies.cart : {});
      cart.add(product, product.id);
      res.cookie("cart", cart, { expiresIn: 3600 * 5 });
      res.send(product);
    }
  });
});

router.get("/removeItem/:id", (req, res) => {
  let productId = req.params.id;

  sqlite.removeItem(productId, (err, product) => {
    if (err) {
      res.redirect("/");
    } else {
      res.send(product);
    }
  });
});

router.get("/addItem", (req, res) => {
  let cart = new Cart(req.cookies.cart ? req.cookies.cart : {});

  res.render('addItem', {
    cartCount: cart.totalQty,
    name: utils.getUser(req.cookies),
    loginError: null,
    registerError: null,
    registerSuccess: null,
    admin: utils.getAdmin(req.cookies),
    itemAdded: false
  });
});

router.post("/addItem", (req, res) => {
  let cart = new Cart(req.cookies.cart ? req.cookies.cart : {});

  let title = req.body.title;
  let price = req.body.price;
  let image = 'assets/' + req.body.image + '.jpg';
  let stock = req.body.stock;

  sqlite.addItem(title, price, image, stock, (err) => {
    res.render('addItem', {
      cartCount: cart.totalQty,
      name: utils.getUser(req.cookies),
      loginError: null,
      registerError: null,
      registerSuccess: null,
      admin: utils.getAdmin(req.cookies),
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
