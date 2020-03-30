const sqlite3 = require("sqlite3").verbose();
const database = "db/database.db" // path to database

exports.getProducts = callback => {
  let sql = `SELECT * FROM products`;
  let db = new sqlite3.Database(database, (err) => {
    if (err) {
      return console.error(err);
    }
  });

  db.all(sql, (err, products) => {
    if (err) {
      console.error(err);
      return callback(err);
    }
    return callback(null, products);
  });

  db.close((err) => {
    if (err) {
      return console.error(err)
    }
  });
};

exports.addToCart = (id, callback) => {
  let sql = `SELECT * FROM products WHERE id = ?`;
  let db = new sqlite3.Database(database, (err) => {
    if (err) {
      return console.error(err);
    }
  });

  db.get(sql, [id], (err, product) => {
    if (err) {
      console.error(err);
      return callback(err);
    } else {
      return callback(null, product)
    }
  });

  db.close((err) => {
    if (err) {
      return console.error(err)
    }
  });
};

exports.registerUser = (username, password, email, callback) => {
  let sqlUsers = `INSERT INTO users(username,password,email) VALUES(?, ?, ?)`;
  let sqlGetID = `SELECT id FROM users WHERE username = ?`
  let sqlUserPaymentDetails = `INSERT INTO userPaymentDetails(userID) VALUES(?)`;

  let db = new sqlite3.Database(database, (err) => {
    if (err) {
      return console.error(err);
    }
  });

  db.run(sqlUsers, [username, password, email], (err, result) => {
    if (err) {
      console.error(err);
      return callback(err);
    } else {
      db.get(sqlGetID, [username], (err, userID) => {
        if (err) {
          console.error(err);
          return callback(err);
        }
        return db.run(sqlUserPaymentDetails, [userID.id], (err, result) => {
          if (err) {
            console.error(err);
            return callback(err);
          }
          return callback(null, result=true);
        });
      });
    }
    return callback(null, result=true);
  });

  db.close((err) => {
    if (err) {
      return console.error(err);
    }
  });
};

exports.loginUser = (username, password, callback) => {
  let sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  let db = new sqlite3.Database(database, (err) => {
    if (err) {
      return console.error(err);
    }
  });

  db.get(sql, (err, row) => {
    if (err) {
      console.error(err);
      return callback(err);
    } else {
      return callback(null, row);
    }
  });

  db.close((err) => {
    if (err) {
      return console.error(err);
    }
  });
};

exports.getUserDetails = (username, callback) => {
  let sql = `SELECT * FROM users WHERE id = ?`;
  let db = new sqlite3.Database(database, (err) => {
    if (err) {
      return console.error(err);
    }
  });

  db.get(sql, [username], (err, row) => {
    if (err) {
      console.error(err);
      return callback(err);
    } else {
      return callback(null, row);
    }
  });

  db.close((err) => {
    if (err) {
      return console.error(err);
    }
  });
};

exports.getUserPaymentDetails = (userID, callback) => {
  let sql = `SELECT * FROM userPaymentDetails WHERE userID = ?`;
  let db = new sqlite3.Database(database, (err) => {
    if (err) {
      return console.error(err);
    }
  });

  db.get(sql, [userID], (err, row) => {
    if (err) {
      console.error(err);
      return callback(err);
    } else {
      return callback(null, row);
    }
  });

  db.close((err) => {
    if (err) {
      return console.error(err);
    }
  });
};

exports.insertOrder = (name, phoneNo, address, cardName, cardNo, expiration, amount, productID, productQty, customerID, callback) => {
  let sql = `INSERT INTO orders(name, phoneNo, address, cardName, cardNo, expiration, amount, productID, productQty, customerID) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  let db = new sqlite3.Database(database, (err) => {
    if (err) {
      console.error(err);
    }
  });

  db.run(sql, [name, phoneNo, address, cardName, cardNo, expiration, amount, productID, productQty, customerID], (err, result) => {
    if (err) {
      console.error(err);
      return callback(err);
    } else {
      return callback(null, result = true);
    }
  });

  db.close((err) => {
    if (err) {
      return console.error(err);
    }
  });
};

exports.updateProfile = (username, email, password, userID, callback) => {
  let sql = `UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?`;
  let db = new sqlite3.Database(database, (err) => {
    if (err) {
      console.error(err);
    }
  });

  db.run(sql, [username, email, password, userID], (err, result) => {
    if (err) {
      console.error(err);
      return callback(err);
    } else {
      return callback(null, result = true);
    }
  });

  db.close((err) => {
    if (err) {
      return console.error(err);
    }
  });
};

exports.updatePaymentDetails = (name, phoneNo, address, cardName, cardNo, expiration, cvc, userID, callback) => {
  let sql = `UPDATE userPaymentDetails SET name = ?, phoneNo = ?, address = ?, cardName = ?, cardNo = ?, expiry = ?, cvc = ? WHERE userID = ?`
  let db = new sqlite3.Database(database, (err) => {
    if (err) {
      console.error(err);
    }
  });

  db.run(sql, [name, phoneNo, address, cardName, cardNo, expiration, cvc, userID], (err, result) => {
    if (err) {
      console.error(err);
      return callback(err);
    } else {
      return callback(null, result = true);
    }
  });

  db.close((err) => {
    if (err) {
      return console.error(err);
    }
  });
};

exports.searchProduct = (criteria, callback) => {
  let sql = `SELECT * from products WHERE title LIKE '%${criteria}%'`;
  let db = new sqlite3.Database(database, (err) => {
    if (err) {
      console.error(err);
    }
  });

  db.all(sql, (err, row) => {
    if (err) {
      console.error(err);
      return callback(err);
    } else {
      return callback(null, row);
    }
  });

  db.close((err) => {
    if (err) {
      return console.error(err);
    }
  });
};

exports .removeItem = (id, callback) => {
  let sql = `DELETE from products WHERE id = ?`;

  let db = new sqlite3.Database(database, (err) => {
    if (err) {
      return console.error(err);
    }
  });

  db.get(sql, [id], (err, product) => {
    if (err) {
      console.error(err);
      return callback(err);
    } else {
      return callback(null, product)
    }
  });

  db.close((err) => {
    if (err) {
      return console.error(err)
    }
  });
};

exports.addItem = (title,price,image,stock, callback) => {
  let sql = `INSERT INTO products(title,Price,image,stock) VALUES(?, ?, ?, ?)`

  let db = new sqlite3.Database(database, (err) => {
    if (err) {
      console.error(err);
    }
  });

  db.run(sql, [title,price,image,stock], (err, result) => {
    if (err) {
      console.error(err);
      return callback(err);
    } else {
      return callback(null, result = true);
    }
  });

  db.close((err) => {
    if (err) {
      return console.error(err);
    }
  });
};

exports.getOrderHistory = (userID, callback) => {
  let sql = `SELECT Price,productID,productQty,title FROM orders CROSS JOIN products ON products.id=orders.productID where customerID = ?`;
  let db = new sqlite3.Database(database, (err) => {
    if (err) {
      return console.error(err);
    }
  });

  db.all(sql, [userID], (err, row) => {

    if (err) {
      console.error(err);
      return callback(err);
    } else {
      return callback(null, row);
    }
  });

  db.close((err) => {
    if (err) {
      return console.error(err);
    }
  });
};
