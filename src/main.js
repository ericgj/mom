'use strict';

var raf = require('raf');
var TypedError = require("error/typed");

var InvalidUpdateInRender = TypedError({
  type: "main.invalid.update.in-render",
  message: "main: Unexpected update occurred in loop.\n" +
    "We are currently rendering a view, " +
        "you can't change state right now.\n" +
    "SUGGESTED FIX: find the state mutation in your view " +
        "or rendering function and remove it.\n" +
    "The view should not have any side effects.\n",
})


module.exports = function(opts, view){
  opts = opts || {}
  
  var currentState = null
  var create = opts.create 
  var diff = opts.diff 
  var patch = opts.patch 
  var createOnly = !!opts.createOnly
  var redrawScheduled = false

  var tree = view()
  var target = create(tree)
  var inRenderingTransaction = false

  return {
    target: target,
    update: update
  }

  function update(state) {
    if (inRenderingTransaction) {
      throw InvalidUpdateInRender()
    }

    if (currentState === null && !redrawScheduled) {
      redrawScheduled = true
      raf(redraw)
    }
    
    currentState = state
  }    

  function redraw() {
    redrawScheduled = false;
    if (currentState === null) {
      return
    }

    inRenderingTransaction = true
    var newTree = view()

    if (createOnly) {
      inRenderingTransaction = false
      create(newTree)
    } else {
      var patches = diff(tree, newTree)
      inRenderingTransaction = false
      target = patch(target, patches)
    }

    tree = newTree
    currentState = null
  }    
  
}
