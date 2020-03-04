const express = require("express");
const app = express();
const path = require("path");
const session = require('express-session')

const dbPath = path.resolve(__dirname,'db/database.db');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbPath);

const indexRoute = require("./routes/index");
const loginRoute = require("./routes/login");
const registerRoute = require("./routes/register");
const cartRoute = require("./routes/cart");

db.serialize(function(){
	db.run("CREATE TABLE IF NOT EXISTS users('id' INTEGER PRIMARY KEY AUTOINCREMENT,'username' TEXT NOT NULL UNIQUE,'password' TEXT NOT NULL, 'Email' TEXT NOT NULL)");
	db.run("CREATE TABLE IF NOT EXISTS products('id' INTEGER PRIMARY KEY AUTOINCREMENT, 'title' TEXT NOT NULL, 'Price' FLOAT NOT NULL, 'image' TEXT ,'ProductDescripion' TEXT)");
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
app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/cart", cartRoute);

app.listen(3000, () => console.log("Server started"));
