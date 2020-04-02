const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const secret = "pretty-good-secret-this";

exports.hash = data => crypto.createHash("md5").update(data).digest("hex");

exports.authorize = (user = {}) => jwt.sign(user, secret, { expiresIn: "2h", algorithm: "HS256" });
exports.verify = (token) => jwt.verify(token, secret, { expiresIn: "2h", algorithm: "HS256" });