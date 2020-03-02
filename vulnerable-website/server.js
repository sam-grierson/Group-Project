const express = require("express");
const app = express();
const path = require("path");
const session = require('express-session')

const indexRoute = require("./routes/index");
const loginRoute = require("./routes/login");
const registerRoute = require("./routes/register");
const cartRoute = require("./routes/cart");

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