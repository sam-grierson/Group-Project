const expressJwt = require("express-jwt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const publicKey = "testPublicKey"
module.exports.publicKey = publicKey
const privateKey = "testPrivateKey"

exports.hash = data => crypto.createHash("md5").update(data).digest("hex");

exports.isAuthorized = () => expressJwt({ secret: this.publicKey });
exports.authorize = (user = {}) => jwt.sign(user, privateKey, { expiresIn: 3600 * 5, algorithm: "HS256"});
exports.verify = (token) => jwt.verify(token, publicKey, {expiresIn: 3600 * 5, algorithm: "HS256"});