function editProfile() {
  document.getElementById('editProfile').style.display = 'none';
  document.getElementById('saveProfile').style.display = 'block';
  document.getElementById('cancelProfile').style.display = 'block';
  document.getElementById('user').disabled = false;
  document.getElementById('email').disabled = false;
  document.getElementById('pass').disabled = false;
  document.getElementById('pass').type = 'text';
};

function cancelProfile() {
  document.getElementById('editProfile').style.display='block';
  document.getElementById('saveProfile').style.display='none';
  document.getElementById('cancelProfile').style.display='none';
  document.getElementById('user').disabled = true;
  document.getElementById('email').disabled = true;
  document.getElementById('pass').disabled = true;
  document.getElementById('pass').type = 'password';
};

function editPayment() {
  document.getElementById("editPayment").style.display = "none";
  document.getElementById("savePayment").style.display = "block";
  document.getElementById("cancelPayment").style.display = "block";
  document.getElementById("name").disabled = false;
  document.getElementById("phoneNo").disabled = false;
  document.getElementById("address").disabled = false;
  document.getElementById("cardName").disabled = false;
  document.getElementById("cardNo").disabled = false;
  document.getElementById("expiration").disabled = false;
  document.getElementById("cvc").disabled = false;
};

function cancelPayment () {
  document.getElementById("editPayment").style.display = "block";
  document.getElementById("savePayment").style.display = "none";
  document.getElementById("cancelPayment").style.display = "none";
  document.getElementById("name").disabled = true;
  document.getElementById("phoneNo").disabled = true;
  document.getElementById("address").disabled = true;
  document.getElementById("cardName").disabled = true;
  document.getElementById("cardNo").disabled = true;
  document.getElementById("expiration").disabled = true;
  document.getElementById("cvc").disabled = true;
};

function editCheckout () {
  let inputs = document.getElementsByClassName('input-box');
  for (var i=0; i < inputs.length; i++) {
    inputs[i].disabled = false;
  };
};

function add(id) {
  $.ajax({
    type: 'GET',
    url: '/add-cart/' + id
  })
  .done(function(data) {
    window.location.reload();
  });
};

function remove(id) {
  $.ajax({
    type: 'GET',
    url: '/removeItem/' + id
  })
  .done(function(data) {
    window.location.reload();
  });
};
