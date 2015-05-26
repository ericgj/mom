'use strict';

var mori = require('mori');
var isArray = require('is-array');
var identity = function(a){return a;};

module.exports = function Cursor_(getter, setter){
  setter = setter || identity;

  function Cursor(addr){
    if (!(this instanceof Cursor)) return new Cursor(addr);
    if (arguments.length < 1) return new Cursor([]);
    this.base = addr;
    this._listeners = mori.hashMap();
  }

  Cursor.prototype.refine =
  Cursor.prototype.child = function(addr){
    return new Cursor( concat(this.base,addr) );
  }

  Cursor.prototype.get =
  Cursor.prototype.value = function(addr){
    return get(this.base, addr);
  }

  Cursor.prototype.transact = function(addr, f, tag){
    return transact(this, this.base, addr, f, tag);
  }

  Cursor.prototype.listen = function(key, f){
    this._listeners = mori.assoc(this._listeners, key, f);
    return this;
  }
  
  Cursor.prototype.notify = function(txdata){
    var c = Cursor();  // top-level
    mori.each(this._listeners, function(_,f){
      f(txdata, c);
    });
  }
  
  return Cursor;

  function get(base,addr){
    if (undefined === addr) return get(base, []);
    return mori.getIn( getter(), concat(base,addr) );
  }

  function transact(curs,base,addr,f,tag){
    var path = concat(base,addr);
    var oldv = get(path);
    setter( mori.updateIn( getter(), path, f) );
    var newv = get(path);
    var txdata = mori.hashMap(
      'path', path,
      'oldValue', oldv,
      'newValue', newv
    );
    if (!(undefined === tag)) txdata = mori.assoc(txdata, 'tag', tag);
    curs.notify(txdata);
    return newv;
  }
  
}

function concat(a,b){
  a = isArray(a) ? a : [a];
  b = isArray(b) ? b : [b];
  return a.concat(b);
}

