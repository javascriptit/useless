/*  Array extensions
    ======================================================================== */

_.withTest ('Array extensions', function () {

    var arr = [1,3,2,3,3,4,3]

    $assert ([arr.first, arr.top, arr.last], [1, 3, 3])

    $assert (arr.take (4), [1,3,2,3])

    $assert ([arr.contains (4), arr.contains (9)], [true, false])

    $assert (arr.lastIndex, 6)

    $assert (arr.copy, arr)
    $assert (arr.copy !== arr)

    $assert (arr.remove (3), [1,2,4]) // it is fast
    $assert (arr,            [1,2,4]) // and mutates original (thats why fast)
                                      // for immutable version, use underscore's _.without

    $assert (arr.removeAll (),   [])
    $assert (arr,                [])

    $assert (['a','b','c'].removeAt (1),    ['a','c'])      // NOTE: mutates original
    $assert (['a','c'].insertAt ('b', 1),   ['a','b','c'])  // NOTE: mutates original

    $assert ([0,1,2].itemAtWrappedIndex (4) === 1)

             arr =         [1,2,3]
    $assert (arr.reversed, [3,2,1])
    $assert (arr,          [1,2,3]) // does not mutate original (in contrary to .reverse)
                                        
    $assert ([[1], [[2], 3], 4].flat,         [1, [2], 3, 4])
    $assert ([[1,2,3], [4,5,6]].zip (_.sum),  [5,7,9])
    $assert (_.zap ([1,2,3], [4,5,6], _.sum), [5,7,9])

    $assert (['a','b','c'].swap (1,2), ['a','c','b']) // NOTE: mutates original

    $assert ([1].random === 1) // returns random item from array
    $assert ([].random === undefined)

    $assert ([['foo', 'bar'].join (),
              ['foo', 'bar'].join ('.'),
              ['foo', 'bar'].join (777),
              ['foo'       ].join (777),
              [       'bar'].join ('.')], ['foobar', 'foo.bar', ['foo', 777, 'bar'], 'foo', 'bar'])

}, function () {

    $extensionMethods (Array, {

        each:        _.each,
        map:         _.map,
        reduce:      _.reduce,
        reduceRight: _.reduceRight,
        zip:         _.zipWith,
        groupBy:     _.groupBy,
        indexBy:     _.indexBy,
        filter:      _.filter,
        flat:        _.flatten.tails2 (true),
        object:      _.object,

        join: (function (strJoin) {
                    return $forceOverride (function (arr, delim) { delim = (arguments.length < 2) ? '' : delim
                                                if (/*_.isString (arr[0]) && */ // semantically correct, but breaks compat
                                                    _.isString (delim)) { return strJoin.call (arr, delim) }
                                                                   else { return _.reduce2 (arr, function (a, b) { return [a].concat ([delim, b]) }) } }) }) (Array.prototype.join),

        contains: function (arr, item) { return arr.indexOf (item) >= 0 },

        top:   function (arr) { return arr[arr.length - 1] },        
        first: function (arr) { return arr[0] },
        last:  function (arr) { return arr[arr.length - 1] },
        
        take: function (arr, n) { return arr.slice (0, n) },

        before: function (arr, x) { var i = arr.indexOf (x); return i < 0 ? arr : arr.slice (0, i - 1) },
        after: function (arr, x)  { var i = arr.indexOf (x); return i < 0 ? arr : arr.slice (i + 1) },

        isEmpty: function (arr) { return arr.length === 0 },
        notEmpty: function (arr) { return arr.length > 0 },

        lastIndex: function (arr) { return arr.length - 1 },

        random: function (arr) {
            return arr[_.random (0, arr.lastIndex)] },

        copy: function (arr) {
            return arr.slice (0) },

        removeAll: $method (function (arr) {
                        return arr.splice (0, arr.length), arr }),

        remove: function (arr, item) {
            var i; while ((i = arr.indexOf (item)) !== -1) {
                arr.splice (i, 1) } return arr },

        removeAt: function (arr, index) {
            arr.splice (index, 1); return arr },

        insertAt: function (arr, item, index) {
            arr.splice (index, 0, item); return arr },

        itemAtWrappedIndex: function (arr, i) {
            return arr[i % arr.length] },

        reversed: function (arr) {
            return arr.slice ().reverse () },

        swap: $method (function (arr, indexA, indexB) {
            var a = arr[indexA], b = arr[indexB]
            arr[indexA] = b
            arr[indexB] = a
            return arr }) })

    _.zap = function (firstArg) { /* (arg1..argN fn) syntax */
        var zippo = _.last (arguments)
        return _.reduce (_.rest (_.initial (arguments)), function (memo, row) {
                        return _.times (Math.max (memo.length, row.length), function (i) {
                            return zippo (memo[i], row[i]) }) }, firstArg) } })

