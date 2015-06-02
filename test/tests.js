'use strict';

// Makeshift mocha test runner to deal with async loading.
// Note all libs for tests are loaded here, then all tests loaded, then mocha run.

Promise.all([
  System.import('assert'),
  System.import('mori'),
  System.import('src/cursor'),
  System.import('src/util/cursor'),
  System.import('src/util/mori')
]).then( apply(tests) )
  .then( mocha.run.bind(null,null) );

function apply(fn){
  return function(deps){
    fn.apply(null, deps);
  }
}

function tests(assert, mori, Cursor, util, moriUtil){
  window.mori = mori; // for debug

  test_cursor();
  test_mori_utils();


  function test_cursor(){

    describe('cursor get', function(){

      var initial = { a: "kazoo", b: { c: [1,2,3] } };
      var atom = mori.toClj(initial);
      var getter = function(){ return atom; };
      var cursor = Cursor(getter)([]);

      it('should get value when no key passed', function(){
        assert.equal( atom, cursor.get() );
      })

      it('should get single key', function(){
        assert.equal( 'kazoo', cursor.get('a') );
      });

      it('should get compound key', function(){
        assert.equal( 2, cursor.get(['b','c',1]) );
      });

    })
    
    describe('cursor refine', function(){

      var initial = { a: "kazoo", b: { c: [1,2,3] } };
      var atom =  mori.toClj(initial);
      var getter = function(){ return atom; };
      var cursor = Cursor(getter)([]);

      it('should get value from child cursor', function(){
        var child = cursor.refine('a');
        assert.equal( 'kazoo', child.get() );
      });

      it('should get single key from child cursor', function(){
        var child = cursor.refine(['b','c']);
        assert.equal( 1, child.get(0) );
      });

      it('should get compound key from child cursor', function(){
        var child = cursor.refine('b');
        assert.equal( 3, child.get(['c',2]) );
      });
      
    })

    describe('cursor update', function(){
      var initial, atom, cursor;
      beforeEach( function(){
        initial = { a: "kazoo", b: { c: [1,2,3] } };
        atom = mori.toClj(initial);
        var getter = function(){ return atom; };
        var setter = function(v){ atom = v; };
        cursor = Cursor(getter, setter)([]);
      });
      
      it('should throw error when no key passed and top-level cursor', function(){
        var changed = {something: 'else' };
        assert.throws( function(){ cursor.update([], changed ); } );
      });

      it('should update when no key passed and child cursor', function(){
        var changed = { a: "atchoo", b: initial.b };
        var child = cursor.refine('a');
        child.update([], 'atchoo');
        assert.equal( 'atchoo', child.get() );
        assert.deepEqual( changed, mori.toJs(cursor.state()) );
      });

      it('should update single key', function(){
        var changed = { a: "atchoo", b: initial.b };
        cursor.update('a', 'atchoo');
        assert.equal( 'atchoo', cursor.get('a') );
        assert.deepEqual( changed, cursor.mutable() );
      });

      it('should update compound key', function(){
        var changed = { a: initial.a, b: { c: 'changed' } };
        cursor.update(['b','c'], 'changed');
        assert.equal( 'changed', cursor.get(['b','c']) );
        assert.deepEqual( changed, mori.toJs(cursor.get([])) );
      });

    });

    describe('cursor transact', function(){
      var initial, atom, cursor;
      beforeEach( function(){
        initial = { a: "kazoo", b: { c: [1,2,3] } };
        atom = mori.toClj(initial);
        var getter = function(){ return atom; };
        var setter = function(v){ atom = v; };
        cursor = Cursor(getter, setter)([]);
      });
      
      it('should update a key to hashmap based on existing value', function(){
        var changed = { a: "kazooed", b: { c: [1,2,3] } };
        cursor.transact('a', function(v){ return v + 'ed'; });
        assert.deepEqual( changed, cursor.mutable() );
      });

      it('should notify listener with js old-new values and path', function(){
        var notifs = [];
        cursor.listen( 'test', function(txdata,c){ notifs.push(txdata); } );
        var changed = { a: "kazooed", b: { c: [1,2,3] } };
        cursor.transact('a', function(v){ return v + 'ed'; });
        console.debug('notifications: %o', notifs);
        assert.equal(1, notifs.length);
        assert.deepEqual(['a'], notifs[0].path );
        assert.equal( initial.a, notifs[0].oldValue );
        assert.equal( changed.a, notifs[0].newValue );
      });

      it('should update a vector based on existing values', function(){
        var changed = { a: "kazoo", b: { c: [2,3,4] } };
        cursor.transact(['b','c'], function(v){ return mori.map(mori.inc,v); });
        assert.deepEqual( changed, cursor.mutable() );
      });

      it('should notify listener with mori old-new values and path', function(){
        var notifs = [];
        cursor.listen( 'test', function(txdata,c){ notifs.push(txdata); } );
        var changed = { a: "kazoo", b: { c: [2,3,4] } };
        cursor.transact(['b','c'], function(v){ return mori.map(mori.inc,v); });
        console.debug('notifications: %o', notifs);
        assert.equal(1, notifs.length);
        assert.deepEqual(['b','c'], notifs[0].path );
        assert.deepEqual( initial.b.c, mori.toJs(notifs[0].oldValue) );
        assert.deepEqual( changed.b.c, mori.toJs(notifs[0].newValue) );
      });

    });

    describe('cursor utils: refine', function(){

      var initial = {'folks': [
        {'name': 'Alice', 'active': false },
        {'name': 'Bob', 'active': true },
        {'name': 'Cedric', 'active': true },
        {'name': 'Damion', 'active': false }
      ]};
      var atom = mori.toClj(initial);
      var getter = function(){ return atom; };
      var cursor = Cursor(getter)([]);

      var finder = function(i,rec){ return mori.get(rec,'active',false); };
      var firstActive = util.refineFirstWhere.bind(null, finder); 
      var allActive = util.refineWhere.bind(null, finder);

      it('refineFirstWhere should refine cursor to first record matching predicate', function(){
        var child = firstActive(cursor.refine('folks'));
        console.debug( 'refineFirstWhere: %o', child.mutable() );
        assert.deepEqual( initial.folks[1], child.mutable() );
      });

      it('refineWhere should return vector of refined cursors for each record matching predicate', function(){
        var children = allActive(cursor.refine('folks'));
        var act = mori.toJs( mori.map(function(child){ return child.state(); }, children) );
        console.debug( 'refineWhere: %o', act );
        assert.deepEqual( [ initial.folks[1], initial.folks[2] ], act );
      });

      it('refineAll should return vector of refined cursors for each record', function(){
        var children = util.refineAll('folks', cursor);
        var act = mori.toJs( mori.map(function(child){ return child.state(); }, children) );
        console.debug( 'refineAll: %o', act );
        assert.deepEqual( initial.folks, act );
      });

    });

  }

  function test_mori_utils(){ 
    describe('mori utils: values', function(){

      var initial = { a: "z", b: "y", c: "x", d: ['a','b','c','d'] };
      var atom = mori.toClj(initial);

      it('should get values from hashmap, with default value for undefined keys', function(){
        var subject =  moriUtil.values(atom, ['a','c','e']); 
        assert.deepEqual( ['z','x',null], mori.toJs(subject) );
      });

      it('should get values from vector, with default value for undefined indexes', function(){
        var subject = moriUtil.values(mori.get(atom,'d'), [0,2,4,6], 'N/A');
        assert.deepEqual( ['a','c','N/A','N/A'], mori.toJs(subject) );
      });

      it('should get values when no default value specified, with same behavior as mori when no default value', function(){
        var subject =  moriUtil.values(atom, ['a','c','e']); 
        assert.deepEqual( ['z','x',null], mori.toJs(subject) );
      });

    });

    describe('mori utils: projection', function(){

      var initial = { a: "z", b: "y", c: "x", d: ['a','b','c','d'] };
      var atom = mori.toClj(initial);

      it('should get projection from hashmap, with default value for undefined keys', function(){
        var subject =  moriUtil.projection(atom, ['a','c','e'], null); 
        assert.deepEqual( {'a': 'z', 'c': 'x', 'e': null}, mori.toJs(subject) );
      });

      it('should get projection from vector, with default value for undefined indexes', function(){
        var subject = moriUtil.projection(mori.get(atom,'d'), [0,2,4,6], 'N/A');
        assert.deepEqual( {'0': 'a', '2': 'c', '4': 'N/A', '6': 'N/A'}, mori.toJs(subject) );
      });

      it('should get projection when no default value specified, with same behavior as mori when no default value', function(){
        var subject =  moriUtil.projection(atom, ['a','c','e']); 
        assert.deepEqual( {'a': 'z', 'c': 'x', 'e': null}, mori.toJs(subject) );
      });

    });

  }

}
