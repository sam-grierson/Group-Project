module.exports = function Sqlite() {
  const sqlite3 = require("sqlite3").verbose();
  const db = new sqlite3.Database("db/database.db", (err) => {
    if (err) {
      return console.error(err);
    }
  });

  this.getProducts = function(callback) {  
    let sql = `SELECT * FROM products`;

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
    let sql = `INSERT INTO users(username,password,email) VALUES(?, ?, ?)`;

    db.run(sql, [username, password, email], (err, result) => {
      if (err) {
        console.error(err);
        return callback(err);
      } else if (err) {
        console.error(err);
        return callback(err);
      } else {
        // return true for successful database entry
        return callback(null, result = true); 
      }
    });

    db.close((err) => {
      if (err) {
        return console.error(err);
      }
    });
  };

  this.loginUser = function(username, password, callback) {
    let sql = `SELECT * FROM users WHERE username = ? AND password = ?`;

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
  }
};