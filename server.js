const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");

const dbPath = path.resolve(__dirname,'db/database.db');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbPath);

const indexRoute = require("./routes/index");
const usersRoute = require("./routes/users");
const cartRoute = require("./routes/cart");
const checkoutRoute = require("./routes/checkout");
const profileRoute = require("./routes/profile");

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'username' TEXT NOT NULL UNIQUE, 'password' TEXT NOT NULL, 'email' TEXT NOT NULL)");
  db.run("CREATE TABLE IF NOT EXISTS userPaymentDetails('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'name' TEXT, 'phoneNo' TEXT, 'address' TEXT, 'cardName' TEXT, 'cardNo' INTEGER, 'expiry' TEXT, 'cvc' INTEGER, 'userID' INTEGER NOT NULL, FOREIGN KEY (userID) REFERENCES users(id))");
	db.run("CREATE TABLE IF NOT EXISTS products('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'title' TEXT NOT NULL, 'Price' FLOAT NOT NULL, 'image' TEXT ,'ProductDescripion' TEXT)");
	db.run("CREATE TABLE IF NOT EXISTS orders('id' INTEGER PRIMARY KEY AUTOINCREMENT,'name' TEXT NOT NULL,'phoneNo' TEXT NOT NULL,'address' TEXT NOT NULL,'cardName' TEXT NOT NULL,'cardNo' INTEGER NOT NULL,'expiration' TEXT NOT NULL, 'amount' INTEGER NOT NULL,'productID' INTEGER NOT NULL, 'productQty' INTEGET NOT NULL, 'customerID' INTEGER NOT NULL, FOREIGN KEY (productID) REFERENCES products(id), FOREIGN KEY (customerID) REFERENCES users(id))");
});


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(cookieParser());

app.use("/", indexRoute);
app.use("/users", usersRoute);
app.use("/cart", cartRoute);
app.use("/checkout", checkoutRoute);
app.use("/profile", profileRoute);

app.listen(3000, () => console.log("Server started"));