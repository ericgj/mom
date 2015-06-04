'use strict';

var mori = require('mori');
var xtend = require('xtend');
var util = require('./util/cursor');
var concat = util.concat;
var identity = function(a){return a;};

module.exports = function Cursor_(getter, setter){
  setter = setter || identity;

  function Cursor(addr){
    if (!(this instanceof Cursor)) return new Cursor(addr);
    if (arguments.length < 1) return new Cursor([]);
    this.base = addr;
    this._listeners = Object.create(null);
  }

  // note: copies listeners
  Cursor.prototype.clone = function(){
    var c = new Cursor( this.base.slice(0) );
    for (k in this._listeners) c.listen(k, this._listeners[k]);
    return c;
  }

  Cursor.prototype.refine = function(addr){
    return new Cursor( concat(this.base,addr) );
  }

  Cursor.prototype.value =
  Cursor.prototype.get = function(addr, defval){
    return get(this.base, addr, defval);
  }
  
  Cursor.prototype.state = function(){ return this.get(); }

  Cursor.prototype.path = function(){ return this.base; }

  Cursor.prototype.mutable =
  Cursor.prototype.js = function(addr, defval){
    return mori.toJs(this.get(addr,defval));
  }

  Cursor.prototype.transact = function(addr, f, tag){
    return transact(this, this.base, addr, f, tag);
  }

  Cursor.prototype.update = function(addr, v, tag){
    return this.transact(addr, function(){ return v; }, tag);
  }

  Cursor.prototype.listen = function(key, f){
    var listeners = xtend({},this._listeners);
    listeners[key] = f;
    this._listeners = listeners;
    return this;
  }
  
  Cursor.prototype.notify = function(txdata){
    var c = Cursor();  // fresh top-level cursor, no listeners
    for (var k in this._listeners){
      var f = this._listeners[k];
      f(txdata, c);
    }
  }
  
  return Cursor;

  function get(base,addr,defval){
    if (undefined === addr) return get(base, [], defval);
    if (undefined === defval){
      return mori.getIn( getter(), concat(base,addr) );
    } else {
      return mori.getIn( getter(), concat(base,addr), defval );
    }
  }

  function transact(curs,base,addr,f,tag){
    var path = concat(base,addr);
    if (path.length == 0) throw new Error('Cannot update via top-level cursor');
    var oldv = get(path);
    setter( mori.updateIn( getter(), path, f) );
    var newv = get(path);
    var txdata =  {
      'path': path,
      'oldValue': oldv,
      'newValue': newv
    };
    if (!(undefined === tag)) txdata.tag = tag;
    curs.notify(txdata);
    return newv;
  }
  
}



