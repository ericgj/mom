'use strict';

// mori utils

var mori = require('mori');

var util = module.exports = {
  keysWhere: keysWhere
}

/* Filter sequence (vector or hashmap) by given predicate, return vector of
   keys (indicies) that match predicate. Useful for refining cursors (cf.
   util.cursor.refineFirstWhere, refineWhere)
   
     ( (Key a) Seq ) => Vec<Key>
 */
function keysWhere(f, seq){ 
  return (
    mori.reduceKV( function(acc,k,v){
        if ( f(k,v) ) return mori.conj(acc, k);
        return acc;
      }, mori.vector(), seq
    )
  )
}
