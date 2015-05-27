/*

Adapted from https://github.com/Raynos/main-loop 

Copyright © 2014 Raynos.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

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
