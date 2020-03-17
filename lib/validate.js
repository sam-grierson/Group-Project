exports.isEmail = (email) => {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return true;
  } else {
    return false;
  }
};

// tests for a visa card
exports.isCard = (cardNo) => {
  if (/^(?:4[0-9]{12}(?:[0-9]{3})?)$/.test(cardNo)) {
    return true;
  } else {
    return false;
  }
};