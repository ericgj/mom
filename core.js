'use strict';

var mori = require('mori');
var xtend = require('xtend');
var isArray = require('x-is-array');
var observ = require('./src/observ');
var vdom = require('./vdom');
var cursorutil = require('./src/util/cursor')
  , refineAll = cursorutil.refineAll

var core = module.exports = {
  atom: atom,
  cursor: require('./src/cursor'),
  toCursor: toCursor,
  mutable: mori.toJs,
  immutable: mori.toClj,
  root: root,
  build: build,
  buildAll: buildAll,
  build_: build_
}

function atom(o){
  return observ(mori.toClj(o));
}

function toCursor(atom){
  return core.cursor(
    function get(){ return atom(); },
    function set(v){ atom.set(v); }    
  )([]);
}

/* Mount root component and bind atom updates to RAF.

*/
function root(atom, app, target, opts){
  var cursor = toCursor(atom);
  var loop = vdom.main( build.bind(null, app, cursor, opts), target );
  
  atom(loop);
  
  return loop;
}


/* Render and return root component (vnode) using current atom state.
   Does not bind to the DOM or apply patches.  Useful for testing.
*/
function vroot(atom, app, opts){
  var cursor = toCursor(atom);
  return build(app, cursor, opts);
}


function build(fn, x, opts){
  var instr = opts && opts.instrument;
  return _build(instr, fn, x, opts);
}

function buildAll(fn, xs, opts){
  
  // helper for when xs is an array
  if (isArray(xs)) return buildAll(fn, mori.vector.apply(null,xs), opts);

  // helper for when xs is a cursor
  if ('function' == typeof xs.refine) return buildAll(fn, refineAll([],xs), opts);

  return ( 
    mori.reduceKV( function(acc,i,x){
      acc.push( build(fn, x, xtend({index: i}, opts)) );
      return acc;
    }, [], xs)
  );
}



function _build(instrument, fn, x, opts){
  var ret;
  if (instrument){
    ret = instrument(fn,x,opts);
    if (undefined === ret){
      return build_(fn,x,opts);
    } else {
      return ret;
    }
  } else {
    return build_(fn,x,opts);
  }
}

function build_(fn, x, opts){
  return fn(x,opts);
}

