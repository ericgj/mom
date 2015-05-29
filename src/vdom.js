'use strict';

var vdom = module.exports = {
  diff:   require('virtual-dom/diff'),
  patch:  require('virtual-dom/patch'),
  create: require('virtual-dom/create-element'),
  html:   require('virtual-dom/h'),
  svg:    require('virtual-dom/virtual-hyperscript/svg'),
  thunk:  require('vdom-thunk'),
  main:   require('./main')
}

// conventional abbreviations
vdom.h = vdom.html;  
vdom.s = vdom.svg;

