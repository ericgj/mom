'use strict';
var raf = require('raf');

function invalidUpdate(state, lastState, lastTree){
  var e = new Error('Unexpected update occured in loop.')
  e.state = state;
  e.lastState = lastState;
  e.lastTree = lastTree;
  return e;
}

// note if you don't want to attach to the DOM, el can be an empty VNode
module.exports = function main(patch, app, el){  
  var inTrans = false;
  var lastState = null;
  var redrawScheduled = false;
  var lastTree = patch(el, app());
  
  return update; 

  function update(state){
    if (inTrans) throw invalidUpdate(state, lastState, lastTree);
    if (lastState === null && !redrawScheduled) {
      redrawScheduled = true;
      raf(redraw);
    }
    lastState = state;
  }
  
  function redraw(){
    redrawScheduled = false;
    if (lastState === null) return;
    
    inTrans = true;
    
    var tree = app();
    patch(lastTree, tree);
    
    inTrans = false;
    lastTree = tree;
    lastState = null;
  }
}
