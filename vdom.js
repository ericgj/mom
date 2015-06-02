'use strict';

var vdom = module.exports = {
  diff:   require('virtual-dom/diff'),
  patch:  require('virtual-dom/patch'),
  create: require('virtual-dom/create-element'),
  html:   require('virtual-dom/h'),
  svg:    require('virtual-dom/virtual-hyperscript/svg'),
  thunk:  require('vdom-thunk'),
  main:   require('./src/main')
}

// conventional abbreviations
vdom.h = function h(){ return vdom.html.apply(vdom.html, arguments); }  
vdom.s = function s(){ return vdom.svg.apply(vdom.svg, arguments); }

