/*  stdlib.js extends Underscore.js
    ======================================================================== */

_.extend (_ = require ('underscore'), {
    hasStdlib: true })


/*  Abstract _.values
    ======================================================================== */

_.deferTest (['stdlib', 'values2'], function () {

    $assert (_.values2 (undefined), [])
    $assert (_.values2 (_.identity), [_.identity])
    $assert (_.values2 ('foo'), ['foo'])
    $assert (_.values2 (['foo', 'bar']), ['foo', 'bar'])
    $assert (_.values2 ({ f: 'foo', b: 'bar' }), ['foo', 'bar'])

}, function () { _.mixin ({
                    values2: function (x) {
                        if (_.isArray (x))                  { return x }
                        else if (_.isStrictlyObject (x))    { return _.values (x) }
                        else if (_.isEmpty (x))             { return [] }
                        else                                { return [x] } } }) })

/*  Map 2.0
    ======================================================================== */

/*  Semantically-correct abstract map (maps any type of value)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

_.deferTest (['stdlib', 'map2'], function () { var plusBar = _.appends ('bar')

    $assert (_.map2 ('foo', plusBar), 'foobar')
    $assert (_.map2 (['foo'], plusBar), ['foobar'])
    $assert (_.map2 ({ foo: 'foo' }, plusBar), { foo: 'foobar' })

}, function () { _.mixin ({
                    map2: function (value, fn, context) {
                        if (_.isArray (value)) {
                            return _.map (value, fn, context) }
                        else if (_.isStrictlyObject (value)) {
                            return _.objectMap (value, fn, context) }
                        else {
                            return fn.call (context, value) } } })})

/*  Hyper map (deep) #1 — maps leafs
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

_.deferTest (['stdlib', 'mapMap'], function () {

    $assert (_.mapMap ( 7,  _.typeOf),  'number')   // degenerate cases
    $assert (_.mapMap ([7], _.typeOf), ['number'])
    $assert (_.mapMap ([ ], _.typeOf), [        ])

    $assert (_.mapMap ( {   foo: 7,
                            bar: ['foo', {
                                bar: undefined } ] }, _.typeOf),
                        
                        {   foo: 'number',
                            bar: ['string', {
                                bar: 'undefined' } ] }) },

    function () {

        _.mixin ({ mapMap: _.hyperOperator (_.map2, _.arity1) }) })


/*  Internal impl.
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

_.withTest (['stdlib', 'objectMap'], function () {

        var obj     = { a: 1, b: 2 }
        var plusOne = function (v) { return v + 1 }
        var crazy   = function (v, k) { return k + (v + 1) }

        $assert ({ a: 2, b: 3 },        _.objectMap (obj, plusOne))
        $assert ({ a: 'a2', b: 'b3' },  _.objectMap (obj, crazy))

        _.objectMap (obj, function () { $assert (this, 42) }, 42) }, function () { _.extend (_, {

    objectMap: function (obj, fn, context) {
                    return _.object (_.map (obj,
                        function (v, k) {
                            return [k, fn.call (context, v, k)] })) } }) })



/*  Filter 2.0: fast, coupled with map semantics, compatible with original
    behavior. Hyperoperator-powered filter (deep one).
    ======================================================================== */

_.deferTest (['stdlib', 'filter 2.0'], function () { var foo = _.equals ('foo')

    // generic filter behavior for any container type

    $assert (_.filter2 (     'foo'  ,   foo),        'foo' )
    $assert (_.filter2 ([    'foo' ],   foo),   [    'foo' ])
    $assert (_.filter2 ({ f: 'foo' },   foo),   { f: 'foo' })
    
    $assert (_.filter2 (     'foo'  ,   _.not (foo)),   undefined)
    $assert (_.filter2 ([    'foo' ],   _.not (foo)),   [])
    $assert (_.filter2 ({ f: 'foo' },   _.not (foo)),   {})

    // map behavior, if predicate returns not boolean (mixed-behavior test not needed - although its the expected case of use)

    $assert (_.filter2 (     'foo' ,    _.constant ('bar')),         'bar'  )
    $assert (_.filter2 ([    'foo' ],   _.constant ('bar')),    [    'bar' ])
    $assert (_.filter2 ({ f: 'foo' },   _.constant ('bar')),    { f: 'bar' })

    // hyper-filter

    $assert (_.filterFilter (
                    { foo: 'foo',   bar: [7, 'foo', { bar: 'foo' }] }, _.not (_.equals ('foo'))),
                    {               bar: [7,        {            }] })

}, function () { _.mixin ({

    reject2: function (value, op) {
        return _.filter2 (value, _.not (op)) },

    filter2: function (value, op) {
        if (_.isArray (value)) {                                var result = []
            for (var i = 0, n = value.length; i < n; i++) {     var v = value[i], opSays = op (v)
                if (opSays === true) {
                    result.push (v) }
                else if (opSays !== false) {
                    result.push (opSays) } } return result }

        else if (_.isStrictlyObject (value)) {                  var result = {}
            _.each (Object.keys (value), function (key) {       var v = value[key], opSays = op (v)
                if (opSays === true) {
                    result[key] = v }
                else if (opSays !== false) {
                    result[key] = opSays } }); return result }

        else {                                                  var opSays = op (value)
            if (opSays === true) {
                return value }
            else if (opSays !== false) {
                return opSays }
            else {
                return undefined } } } })

    _.mixin ({

        filterFilter: _.hyperOperator (_.filter2, _.arity1) }) })


/*  Zip 2.0
    ======================================================================== */

/*  Abstract zip that reduces any types of matrices.
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

_.deferTest (['stdlib', 'zip2'], function () {

    $assert (_.zip2 ([  'f',
                        'o',
                        'o'], _.concat), 'foo')

    $assert (_.zip2 ([  ['f', 'b'],
                        ['o', 'a'],
                        ['o', 'r']], _.concat), ['foo', 'bar'])

    $assert (_.zip2 ([  { foo:'f', bar:'b' },
                        { foo:'o', bar:'a' },
                        { foo:'o', bar:'r' }], _.concat), { foo: 'foo', bar: 'bar' })

    $assert (_.zip2 (   { foo:'f', bar:'b' },           // passing rows as arguments
                        { foo:'o', bar:'a' },
                        { foo:'o', bar:'r' },  _.concat), { foo: 'foo', bar: 'bar' })

    $assert (_.zip2 (undefined, _.concat), undefined)   // degenerate cases
    $assert (_.zip2 (5,         _.concat), 5)
    $assert (_.zip2 ([],        _.concat), [])
    $assert (_.zip2 (['foo'],   _.concat), 'foo')

    // internals (regression tests)

    $assert (_.zipObjectsWith ([
                { name: 'string' },
                { born: 123 }], _.array),
            
                { name: ['string',  undefined],
                  born: [undefined, 123] })

}, function () { _.mixin ({

    zipObjectsWith: function (objects, fn) {
        return _.reduce (_.rest (objects), function (memo, obj) {
            _.each (_.union (_.keys (obj), _.keys (memo)), function (k) {
                var zipped = fn (memo && memo[k], obj && obj[k])
                if (zipped === undefined) {
                    delete memo[k] }
                else {
                    memo[k] = zipped } }); return memo }, _.clone (objects[0])) },

    zip2: function (rows_, fn_) {   var rows = arguments.length === 2 ? rows_ : _.initial (arguments)
                                    var fn   = arguments.length === 2 ? fn_   : _.last (arguments)
        if (!_.isArray (rows) || rows.length === 0) {
            return rows }
        else {
            if (_.isArray (rows[0])) {
                return _.zipWith (rows, fn) }
            else if (_.isStrictlyObject (rows[0])) {
                return _.zipObjectsWith (rows, fn) }
            else {
                return _.reduce (rows, fn) } } } }) })

/*  Hyperzip (deep one).
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

_.deferTest (['stdlib', 'zipZip'], function () {

    $assert (_.zipZip (
            { phones: [{ number: 'number' }] },
            { phones: [{ number: 333 }] }, _.array),
            { phones: [{ number: ['number', 333] }] })

    $assert (_.zipZip ([{   foo: 7,
                            bar: ['foo', {
                                bar: undefined } ] },
                        
                        {   foo: 'number',
                            bar: ['string', {
                                bar: 'undefined' } ] } ], _.array),

                        {   foo: [7, 'number'],
                            bar: [['foo', 'string'], {
                                bar: [undefined, 'undefined'] } ] }) },
function () {

    _.mixin ({ zipZip: _.hyperOperator (_.zip2, _.arity2) }) })


/*  Most useful _.extend derivatives
    ======================================================================== */

_.withTest (['stdlib', 'extend 2.0'], function () {

        /*  Inverted version of _.extend, for humanized narration where it makes sense (not here,
            but see AOP impl for example of such one)
         */
        [(function () {
            var input   = { foo:1,  bar:1 }
            var plus    = { foo:42, qux:1 }
            var gives   = { foo:42, qux:1, bar: 1 }

            $assert (_.extendWith (plus, input), gives) }) (),

        /*  Higher-order version of _.extend, allows to use it as _.map operator, which cuts
            shit in typical arrays-of-objects crunching routines
         */
        (function () {
            var input   = [{ bar:1 }, {}]
            var plus    = _.extendsWith ({ foo:42 })
            var gives   = [{ bar:1, foo:42 }, { foo:42 }]

            $assert (_.map (input, _.arity1 (plus)), gives) }) (),

        /*  Deep version of _.extend, allowing to extend two levels deep (super useful one)
         */
        (function () {
            var input   = { foo:1,  bar: { qux:1 } }
            var plus    = { foo:42, bar: { baz:1 } }
            var gives   = { foo:42, bar: { baz:1, qux:1 }}

            $assert (_.extend2 (input, plus), gives) }) ()]  }, function () {

    _.extend = $restArg (_.extend) // Mark as having rest argument (to make _.flip work on that shit)

    _.extendWith = _.flip (_.extend)                                        
    _.extendsWith = _.flip (_.partial (_.partial, _.flip (_.extend)))   // higher order shit

    _.extend2 = $restArg (function (what) { 
                                return _.extend (what, _.reduceRight (arguments, function (right, left) {
                                    return _.object (_.map (_.union (_.keys (left), _.keys (right)),
                                                            function (key) {
                                                                var lvalue = left[key]
                                                                return [key, (key in right) ?
                                                                                (typeof lvalue === 'object' ?
                                                                                    _.extend (lvalue, right[key]) :
                                                                                    right[key]) :
                                                                                lvalue] }))}, {})) }) })


/*  removes empty contents from any kinds of objects
    ======================================================================== */

_.withTest (['stdlib', 'nonempty'], function () {

    var obj = { blank: {}, empty: [], one: 1, none: undefined, nil: null, clear: '', zero: 0, no: false }
    var arr = [{}, [], 1, undefined, null, '', 0, false]

    $assert (_.nonempty (obj), { one: 1, zero: 0, no: false })
    $assert (_.nonempty (arr), [1, 0, false])

    $assert (_.nonempty (null), undefined)
    $assert (_.nonempty (''),   undefined)

}, function () {

    _.nonempty = function (obj) { return _.filter2 (obj, _.isNonempty) } })


/*  deep cloning of objects (as _.clone is shallow)
    ======================================================================== */

_.withTest (['stdlib', 'cloneDeep'], function () {
    var obj     = { a: [{ b: { c: 'd' } }] }
    var copy    = _.cloneDeep (obj)

    $assert (obj !== copy)  // should be distinct references
    $assert (obj, copy)     // structure should not change

}, function () { _.extend (_, {

    cloneDeep: _.tails2 (_.mapMap, _.identity) }) })


/*  given objects A and B, _.diff subtracts A's structure from B,
    and returns difference in terms of B
    ======================================================================== */

_.deferTest (['stdlib', 'diff'], function () {

        $assert (_.diff ('foo', 'foo'), undefined)
        $assert (_.diff ('foo', 'bar'), 'bar')

        $assert (_.diff ({ a: 1, b: 2, c: 3 },
                         { a: 1, b: 3,      d: 4 }),
                         {       b: 3,      d: 4 })

        $assert (_.diff ([1,2,3], [1,2,3]), undefined)

        $assert (_.diff ([1,'foo',2], [1,2,3]), [2,3])

}, function () {

    _.hyperMatch = _.hyperOperator (function (a, b, pred) {
                                        return _.coerceToUndefined (_.nonempty (_.zip2 (a, b, pred))) }, _.arity2)

    _.diff = _.tails3 (_.hyperMatch, function (a, b) {
                                        return (a === b) ? undefined : b }) })


/*  inverse of _.diff (returns similarities)
    ======================================================================== */

_.deferTest (['stdlib', 'undiff'], function () {

        $assert (_.undiff ('foo', 'foo'), 'foo')
        $assert (_.undiff ('foo', 'bar'), undefined)

        $assert (_.undiff ({ a: 1, b: 2, c: 3 },
                           { a: 1, b: 3,      d: 4 }),
                           { a: 1 })

        $assert (_.undiff ([1,2,3], [1,2,3]), [1,2,3])

        $assert (_.undiff ([1,2], [1,3]), [1,undefined])
        $assert (_.undiff ([1,2], [0,2]), [undefined,2])

}, function () {

    _.hyperMatch = _.hyperOperator (function (a, b, pred) {
                                        return _.coerceToUndefined (_.zip2 (a, b, pred)) }, _.arity2)

    _.undiff = _.tails3 (_.hyperMatch, function (a, b) {
                                            return (a === b) ? b : undefined }) })


/*  Makes { foo: true, bar: true } from ['foo', 'bar']
    ======================================================================== */

_.withTest (['stdlib', 'index'], function () {
    
        $assert (_.index (['foo', 'bar']), { foo: true, bar: true }) }, function () { _.extend (_, {

    index: function (list) {
            var result = {}
            for (var i = 0, n = list.length; i < n; i++) {
                result[list[i]] = true }
            return result } }) })

/*  A shorthand to _.filter + _.map (map with filter behavior).
    ======================================================================== */

_.withTest (['stdlib', 'filterMap'], function () {

    var input     = ['foo', undefined, 'bar']
    var plusBar   = function (x) { return x && (x + 'bar') }
    var notFoobar = function (x) { return x !== 'foobar' }

    $assert (_.filterMap (input, plusBar),            ['foobar', 'barbar'])
    $assert (_.filterMap (input, plusBar, notFoobar), [undefined, 'barbar'])

    _.filterMap.call (42, ['foo'],
        function (x) { $assert (this, 42) },
        function (x) { $assert (this, 42) })

}, function () { _.extend (_, {

    filterMap: function (arr, map_, filter_) { // shit's for performance sake

                    for (var i = 0,
                             n = (arr && arr.length) || 0,
                             map = map_ || _.identity,
                             filter = filter_ || _.isNonempty,
                             result = []; i < n; i++) {
                        
                        var x = map.call (this, arr[i])

                        if (filter.call (this, x)) {
                            result.push (x) } }

                    return result } }) })

/*  For string wrapping
    ======================================================================== */

_.withTest (['stdlib', 'quote'], function () {

        $assert (_.quote      ('qux'),           '"qux"')
        $assert (_.quote      ('qux', '[]'),     '[qux]')
        $assert (_.quote      ('qux', '/'),      '/qux/')
        $assert (_.quote      ('qux', '{  }'),   '{ qux }')
        $assert (_.quoteWith  ('[]', 'qux'), '[qux]') }, function () {

    _.quote = function (s, pattern_) {
                    var pattern = pattern_ || '"'
                    var before  = pattern.slice (0, Math.floor (pattern.length / 2 + (pattern.length % 2)))
                    var after   = pattern.slice (pattern.length / 2) || before

                    return before + s + after }

    _.quoteWith  = _.flip2 (_.quote)
    _.quotesWith = _.higherOrder (_.quoteWith) })

/*  experimental shit (subject to removal)
    ======================================================================== */

_.key = function (fn) {
            return function (value, key) {
                return fn (key) } }

_.filterKeys = function (arr, predicate) {
                    return _.filter (arr, function (v, k) { return predicate (k) }) }

_.rejectKeys = function (arr, predicate) {
                    return _.reject (arr, function (v, k) { return predicate (k) }) }

_.pickKeys = function (obj, predicate) {
                    return _.pick (obj, function (v, k) { return predicate (k) }) }

_.omitKeys = function (obj, predicate) {
                    return _.omit (obj, function (v, k) { return predicate (k) }) }


