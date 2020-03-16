exports.getUser = (session) => {
  if (session.loggedin === true) {
    return session.username;
  } else {
    return false;
  }
};