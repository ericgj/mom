'use strict';

var vdom = require('./vdom');
var xtend = require('xtend');

var core = module.exports = {
  atom: require('observ'),
  cursor: require('./cursor'),
  toCursor: toCursor,
  root: root,
  build: build,
  buildAll: buildAll,
  options: {
    main: {},
    diff: {},
    patch: {},
    create: {}    
  }
}

function toCursor(atom){
  return core.cursor(
    function get(){ return atom(); },
    function set(v){ atom(v); }    
  )([]);
}

// note: unlike in Om, this is not idempotent.
function root(atom, app, target, opts){
  var cursor = toCursor(atom);
  var loop = mainfn( build.bind(null, app, cursor, opts) );
  
  atom(loop.update);
  target.appendChild(loop.target);
  
  return loop;
}

function build(fn, x, opts){
  return fn(x,opts);
}

// not sure this works; depends on how vnode works
function buildAll(fn, xs, opts){
  return xs.map( function(x,i){
    build(fn, x, xtend({index: i}, opts));
  });
}



function mainfn(){
  return vdom.main.bind(null, 
    xtend(
      {
        diff: partialRight(vdom.diff, xtend({},core.options.diff)),
        patch: partialRight(vdom.patch, xtend({},core.options.patch)),
        create: partialRight(vdom.create, xtend({},core.options.create))
      }, core.options.main
    )
  );  
}

function partialRight(fn){
  var args = [].slice.call(arguments,1);
  return function(){
    var innerargs = [].slice.call(arguments,0);
    fn.apply(null, innerargs.concat(args));
  };
}