module.exports = function Sqlite() {
  const sqlite3 = require("sqlite3").verbose();
  const database = "db/database.db" // path to database

  this.getProducts = function(callback) {
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

  this.addToCart = function(id, callback) {
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

  this.registerUser = function(username, password, email, callback) {
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

  this.loginUser = function(username, password, callback) {
    let sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
    let db = new sqlite3.Database(database, (err) => {
      if (err) {
        return console.error(err);
      }
    });

    db.get(sql, [username, password], (err, row) => {
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

  this.getUserDetails = function(username, callback) {
    let sql = `SELECT * FROM users WHERE username = ?`;
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

  this.getUserPaymentDetails = function(userID, callback) {
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

  this.insertOrder = function(name, phoneNo, address, cardName, cardNo, expiration, amount, productID, productQty, customerID, callback) {
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

  this.updateProfile = function(username, email, callback){
    let sql = `UPDATE users SET email = ? WHERE username = ?`;
    let db = new sqlite3.Database(database, (err) => {
      if (err) {
        console.error(err);
      }
    });

    db.get(sql, [email,username], (err, row) => {

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

  this.searchProduct = function(criteria, callback){
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
};
