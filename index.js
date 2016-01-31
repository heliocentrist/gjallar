function Signal(expr) {
  var self = this;

  self.myExpr = undefined;
  self.myValue = undefined;
  self.observers = [];

  self.update = function(exp) {
    self.myExpr = exp;
    self.computeValue(self.caller);
  }

  self.computeValue = function() {
    var newValue = self.myExpr(self);
    if (self.myValue != newValue) {
      self.myValue = newValue;
      var obs = self.observers;
      self.observers = [];
      obs.forEach(function(o) { o.computeValue(); });
    }
  }

  self.apply = function(c) {

    self.observers.push(c);

    if (c.observers.indexOf(self) > -1) {
      throw new Error('Self-referencing signal');
    };

    return self.myValue;
  }

  self.update(expr);
}

var a = new Signal(() => 1);
var b = new Signal(() => 2);
var twicePlusTwo = new Signal((x) => a.apply(x) * 2 + b.apply(x));
var fourth = new Signal((x) => twicePlusTwo.apply(x) * 2);
console.log(fourth.myValue);
a.update((x) => b.apply(x));
console.log(fourth.myValue);
