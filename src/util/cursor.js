'use strict';

// cursor utils

var mori = require('mori');
var isArray = require('x-is-array');
var moriutil = require('./mori');

var util = module.exports = {
  concat: concat,
  values: values,
  projection: projection,
  refineAll: refineAll,
  refineFirstWhere: refineFirstWhere,
  refineWhere: refineWhere
}

function toArray(x){
  if (isArray(x)) return x;
  if (mori.isSeq(x)) return mori.intoArray(x);
  return [x];
}

function concat(a,b){
  return toArray(a).concat(toArray(b));
}

function values(keys, defval, cursor){
  return keys.reduce( function(v,key){
      return mori.conj(v, cursor.get(key, defval));
    }, mori.vector()
  );
}

function projection(keys, defval, cursor){
  return keys.reduce( function(h,key){
      return mori.assoc(h, key, cursor.get(key,defval));
    }, mori.hashMap()
  );
}


function refineAll(prefix, cursor){
  prefix = prefix || [];
  return mori.reduceKV( function(acc, k, v){
      return mori.conj(acc, cursor.refine(concat(prefix,k)) );
    }, mori.vector(), cursor.get(prefix)
  );
}
    
function refineFirstWhere(f, prefix, cursor){
  prefix = prefix || [];
  return cursor.refine( 
    concat( prefix, mori.first(f(cursor.get(prefix))) ) 
  );
}

function refineWhere(f, prefix, cursor){
  prefix = prefix || [];
  return mori.map( function(path){
      return cursor.refine( concat(prefix, path) );
    }, f(cursor.get(prefix))
  );
}

