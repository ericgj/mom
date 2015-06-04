'use strict';

var mori = require('mori');
var xtend = require('xtend');
var observ = require('./src/observ');
var vdom = require('./vdom');

var core = module.exports = {
  atom: atom,
  cursor: require('./src/cursor'),
  toCursor: toCursor,
  mutable: mori.toJs,
  immutable: mori.toClj,
  root: root,
  build: build,
  buildAll: buildAll,
  build_: build_,
  options: {
    main: {},
    dom: { emptyTarget: false }
  }
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

   Note: this is *mostly* idempotent, assuming your target container can be
   emptied each time and the emptyTarget option is set. Otherwise, you will
   need to manage clearing out the target yourself before calling root again.
*/
function root(atom, app, target, opts){
  var cursor = toCursor(atom);
  var loop = main( build.bind(null, app, cursor, opts) );
  
  atom(loop.update);

  if (!!core.options.dom.emptyTarget) empty(target);
  target.appendChild(loop.target);
  
  return loop;
}


/* Render and return root component (vnode) using current atom state.
   Does not bind to the DOM.  Useful for testing.
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
  return ( 
    mori.reduceKV( function(acc,i,x){
      acc.push( build(fn, x, xtend({index: i}, opts)) );
      return acc;
    }, [], xs)
  );
}



function main(view){
  return vdom.main( 
    xtend(
      {
        diff: vdom.diff,
        patch: vdom.patch,
        create: vdom.create
      }, core.options.main
    ),
    view
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

function empty(el, node){
  while (node = el.firstChild) el.removeChild(node);
  return el;
}
