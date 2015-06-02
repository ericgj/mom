'use strict';

// mori utils

var mori = require('mori');

var util = module.exports = {
  values: values,
  projection: projection,
  keysWhere: keysWhere
}

/* Return vector of values for given keys, with given default value for keys
 * that are missing. "Multi-get".
 *
 *   Array<Key> => a => Seq => Vec
 */
function values(keys, defval, seq){
  return keys.reduce( function(v,key){
      return mori.conj(v, mori.get(seq, key, defval));
    }, mori.vector()
  );
}

/* Return hashMap of values for given keys, with given default value for keys
 * that are missing.
 *
 *   Array<Key> => a => Seq => HashMap
 */
function projection(keys, defval, seq){
  return keys.reduce( function(h,key){
      return mori.assoc(h, key, mori.get(seq, key, defval));
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