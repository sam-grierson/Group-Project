const crypto = require("crypto");

exports.hash = data => crypto.createHash("md5").update(data).digest("hex");
