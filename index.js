function StackableVariable() {

  var self = this;

  self.values = [];

  self.getValue = function() {
    return self.values.length === 0 ? undefined : self.values[0];
  }

  self.withValue = function(newValue) {
    return function(operation) {
      self.values.unshift(newValue);
      try {
        return operation();
      } finally {
        self.values.shift();
      }
    }
  }
}

var caller = new StackableVariable();

function Signal(expr) {
  var self = this;

  self.myExpr = undefined;
  self.myValue = undefined;
  self.observers = [];
  self.caller = caller;

  self.update = function(exp) {
    self.myExpr = exp;
    self.computeValue(self.caller);
  }

  self.computeValue = function() {

    var newValue = self.caller.withValue(self)(self.myExpr);
    if (self.myValue != newValue) {
      self.myValue = newValue;
      var obs = self.observers;
      self.observers = [];
      obs.forEach(function(o) { o.computeValue(); });
    }
  }

  self.apply = function() {
    var i = self.caller.getValue();

    self.observers.push(i);
    if (caller.getValue().observers.indexOf(this) > -1) {
      throw new Error('Self-referencing signal');
    };
    return self.myValue;
  }

  self.update(expr);
}

var a = new Signal(() => 1);
var b = new Signal(() => 2);
var twicePlusTwo = new Signal(() => a.apply() * 2 + b.apply());
var fourth = new Signal(() => twicePlusTwo.apply() * 2);
console.log(fourth.myValue);
a.update(() => b.apply());
console.log(fourth.myValue);
