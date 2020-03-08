module.exports = function Cart(oldCart) {
  this.items = oldCart.items || {};
  this.totalQty = oldCart.totalQty || 0;
  this.totalPrice = oldCart.totalPrice || 0;

  this.add = function(item, id) {
    var storedItem = this.items[id];
    if (!storedItem) {
      storedItem = this.items[id] = {item: item, qty: 0, Price: 0};
    };
    storedItem.qty++;
    storedItem.Price = storedItem.item.Price * storedItem.qty;
    this.totalQty++;
    this.totalPrice += storedItem.item.Price;
  };

  this.removeItem = function(id) {
    this.items[id].qty--;
    this.items[id].Price -= this.items[id].item.Price;
    this.totalQty--;
    this.totalPrice -= this.items[id].item.Price;

    if (this.items[id].qty <= 0) {
      delete this.items[id];
    };
  };

  this.clearCart = function() {
    this.items = {};
    this.totalQty = 0;
    this.totalPrice = 0;
  }

  this.generateArray = function() {
    let arr = [];
    for (let id in this.items) {
      arr.push(this.items[id]);
    }
    return arr;
  };
};