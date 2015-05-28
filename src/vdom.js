'use strict';

var vdom = module.exports = {
  diff:   require('virtual-dom/diff'),
  patch:  require('virtual-dom/patch'),
  create: require('virtual-dom/create-element'),
  h:      require('virtual-dom/h'),
  thunk:  require('vdom-thunk'),
  main:   require('./main')
}

