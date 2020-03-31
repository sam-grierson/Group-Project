insecurity = require("./insecurity");

exports.getUser = (cookies) => {
  if (cookies.token) {
    token = insecurity.verify(cookies.token);
    return token.username;
  } else {
    return false;
  }
};

exports.getAdmin = (cookies) => {
  if (cookies.token) {
    token = insecurity.verify(cookies.token);
    if (token.isAdmin) {
      return true;
    } else {
      return false;
    }
  } else {
    return false
  }
};

exports.checkError = (error) => {
  if (error === null) {
    return true;
  } else {
    return false;
  }
};