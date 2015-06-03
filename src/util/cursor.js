'use strict';

// cursor utils

var mori = require('mori');
var isArray = require('x-is-array');
var moriutil = require('./mori')
  , keysWhere = moriutil.keysWhere
  , reduceKV = moriutil.reduceKV;

var util = module.exports = {
  concat: concat,
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


function refineAll(prefix, cursor){
  prefix = prefix || [];
  return reduceKV( function(acc, k, v){
      return mori.conj(acc, cursor.refine(concat(prefix,k)) );
    }, mori.vector(), cursor.get(prefix)
  );
}
    
function refineFirstWhere(f, cursor){
  return cursor.refine( 
    concat( [], mori.first( keysWhere(f, cursor.get()) ) ) 
  );
}

function refineWhere(f, cursor){
  return mori.map( function(path){
      return cursor.refine( concat([], path) );
    }, keysWhere(f, cursor.get())
  );
}

