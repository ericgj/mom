'use strict';

var mori = require('mori');
var xtend = require('xtend');
var observ = require('./observ');
var vdom = require('./vdom');

var core = module.exports = {
  atom: atom,
  cursor: require('./cursor'),
  toCursor: toCursor,
  mutable: mori.toJs,
  immutable: mori.toClj,
  root: root,
  build: build,
  buildAll: buildAll,
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

function build(fn, x, opts){
  return fn(x,opts);
}

function buildAll(fn, xs, opts){
  return xs.map( function(x,i){
    build(fn, x, xtend({index: i}, opts));
  });
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

function empty(el, node){
  while (node = el.firstChild) el.removeChild(node);
  return el;
}
