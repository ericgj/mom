'use strict';

var snabbdom = require('snabbdom');
var main = require('./src/main');

var defaultModules = [
  require('snabbdom/modules/class'), // makes it easy to toggle classes
  require('snabbdom/modules/props'), // for setting properties on DOM elements
  require('snabbdom/modules/style'), // handles styling on elements with support for animations
  require('snabbdom/modules/eventlisteners') // attaches event listeners
];

var modules = [];

var vdom = module.exports = {
  patch:  patch,
  h:      require('snabbdom/h'),
  vnode:  require('snabbdom/vnode'),
  thunk:  require('snabbdom/thunk'),
  modules: setModules,
  main:   _main
}

function setModules(ms){ modules = ms; }

function patch(){
  return snabbdom.init( defaultModules.concat(modules) );
}

function _main(app,el){
  return main(patch(), app, el);
}
