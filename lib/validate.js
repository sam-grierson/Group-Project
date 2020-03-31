exports.isEmail = (email) => {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return true;
  } else {
    return false;
  }
};

// tests for a visa card
exports.isVisaCard = (cardNo) => {
  if (/^(?:4[0-9]{12}(?:[0-9]{3})?)$/.test(cardNo)) {
    return true;
  } else {
    return false;
  }
};

// tests for a master card
exports.isMasterCard = (cardNo) => {
  if (/^(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}$/.test(cardNo)) {
    return true;
  } else {
    return false;
  }
};

exports.isCvc = (cvc) => {
  if(/^[0-9]{3,4}$/.test(cvc)) {
    return true;
  } else {
    return false;
  }
};

exports.isExpiration = (expiration) => {
  if(/^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/.test(expiration)) {
    return true;
  } else {
    return false;
  }
};

exports.isPhoneNumber = (phoneNo) => {
  if(/(([+][(]?[0-9]{1,3}[)]?)|([(]?[0-9]{4}[)]?))\s*[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?([-\s\.]?[0-9]{3})([-\s\.]?[0-9]{3,4})/g.test(phoneNo)) {
    return true;
  } else {
    return false;
  }
};