const express = require("express");
const app = express();
const path = require("path");
const session = require('express-session')

const dbPath = path.resolve(__dirname,'db/database.db');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbPath);

const indexRoute = require("./routes/index");
const usersRoute = require("./routes/users");
const cartRoute = require("./routes/cart");
const checkoutRoute = require("./routes/checkout");

db.serialize(function(){
	db.run("CREATE TABLE IF NOT EXISTS users('id' INTEGER PRIMARY KEY AUTOINCREMENT,'username' TEXT NOT NULL UNIQUE,'password' TEXT NOT NULL, 'Email' TEXT NOT NULL)");
	db.run("CREATE TABLE IF NOT EXISTS products('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'title' TEXT NOT NULL, 'Price' FLOAT NOT NULL, 'image' TEXT ,'ProductDescripion' TEXT)");
	db.run("CREATE TABLE IF NOT EXISTS orders('id' INTEGER PRIMARY KEY AUTOINCREMENT,'firstname' TEXT NOT NULL,'lastname' TEXT NOT NULL,'phoneNo' TEXT NOT NULL,'address' TEXT NOT NULL,'cardName' TEXT NOT NULL,'cardNo' INTEGER NOT NULL,'expMon' INTEGER NOT NULL,'expYr' INTEGER NOT NULL,'amount' INTEGER NOT NULL,'productID' INTEGER NOT NULL,'customerID' INTEGER NOT NULL,FOREIGN KEY (productID) REFERENCES products(id),FOREIGN KEY (customerID) REFERENCES users(id))");
});


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 180 * 60 * 1000}
}));

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

app.use("/", indexRoute);
app.use("/users", usersRoute);
app.use("/cart", cartRoute);
app.use("/checkout", checkoutRoute);

app.listen(3000, () => console.log("Server started"));
