'use strict';

// mori utils

var mori = require('mori');

var util = module.exports = {
  second: second,
  values: values,
  projection: projection,
  keysWhere: keysWhere
}

function second(seq){
  return mori.first(mori.rest(seq));
}

/* Return vector of values for given keys, with given default value for keys
 * that are missing. Note mainly useful as an alternative to destructuring in
 * < ES6 environments. 
 *
 *   Seq => Array<Key> => a => Vec
 */
function values(seq, keys, defval){
  return keys.reduce( function(v,key){
      if (undefined === defval){
        return mori.conj(v, mori.get(seq, key));
      } else {
        return mori.conj(v, mori.get(seq, key, defval));
      }
    }, mori.vector()
  );
}

/* Return hashMap of values for given keys, with given default value for keys
 * that are missing.
 *
 *   Seq => Array<Key> => a => HashMap
 */
function projection(seq, keys, defval){
  return keys.reduce( function(h,key){
      if (undefined === defval){
        return mori.assoc(h, key, mori.get(seq, key));
      } else {
        return mori.assoc(h, key, mori.get(seq, key, defval));
      }
    }, mori.hashMap()
  );
}


/* Filter sequence (vector or hashmap) by given predicate, return vector of
 * keys (indicies) that match predicate. Useful for refining cursors (cf.
 * util.cursor.refineFirstWhere, refineWhere)
 * 
 *   (Key => a => Boolean) => Seq => Vec<Key>
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
