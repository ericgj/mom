'use strict';

module.exports = Observable;

function Observable(value) {
  var listener;
  value = value === undefined ? null : value

  observable.set = function (v) {
    value = v
    if (listener) listener(v);
  }

  return observable

  function observable(fn) {
    if (!fn) {
      return value
    }
    listener = fn;
  }
}