function Signal(expr) {
  var self = this;

  self.myExpr = undefined;
  self.myValue = undefined;
  self.observers = [];

  self.send = function(exp) {
    if (typeof(exp) === 'function') {
      self.myExpr = exp;
    } else {
      self.myExpr = () => exp;
    }
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

  self.map = function(func) {
    return self.flatMap((x) => new Signal(func(x)));
  }

  self.flatMap = function(func) {
    return new Signal((x) => func(self.apply(x)).apply(x));
  }

  self.send(expr);
}

var a = new Signal(1);
var b = new Signal(2);

var twice = a.map((x) => 2*x);
console.log(twice.myValue);
a.send(3);
console.log(twice.myValue);
