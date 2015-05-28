'use strict';

module.exports = InitValueHook;

// ugly, but works. Set custom property on input el

function InitValueHook(v, prefix){
  if (!(this instanceof InitValueHook)) return new InitValueHook(v,prefix);
  prefix = prefix || '__init_';
  this.prefix = prefix;
  this.value = v;
}

InitValueHook.prototype.hook = function(node, propertyName){
  var initprop = this.prefix + propertyName;
  var v = node[initprop];
  if (undefined === v) {
    node[initprop] = node[propertyName] = this.value;
  }
}


