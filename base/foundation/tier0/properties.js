_ = require ('underscore')

/*	Properties
	======================================================================== */

_.withTest ('properties', function () { var obj = {}

	_.defineProperty (obj, 'fourtyTwo',			42)
	_.defineProperty (obj, 'fourtyTwo_too',		function ()  { return 42 })
	_.defineProperty (obj, 'fourtyTwo_orDie',	function (x) { $assert (x == 42); return 42 })
	_.defineProperty (obj, 'fourtyTwo_eitherWay', {
		configurable: true,
		get: function () { return 42 },
		set: function (x) { $assert (x == 42) } })

	$assert (42,
		obj.fourtyTwo,
		obj.fourtyTwo_too,
		obj.fourtyTwo_orDie (42),
		obj.fourtyTwo_eitherWay = 42)

	delete obj.fourtyTwo_eitherWay								// can be deleted if configurable:true
	$assert (obj.fourtyTwo_eitherWay === undefined)

	delete obj.fourtyTwo										// cannot be deleted (as default behavior)
	$assert (obj.fourtyTwo === 42)

	_.defineHiddenProperty (obj, 'hiddenAndDangerous', 42)		// shortut for enumerable:false
	$assert (_.keys (obj).indexOf ('hiddenAndDangerous') < 0)

	$assertCalls (1, function (mkay) {							// memoized property
		_.defineMemoizedProperty (obj, '_42', function () {
													mkay (); return 42 }) 
		$assert (							
			obj._42,								
			obj._42,
			obj._42, 42) }) }, function () { _.extend (_, {

	defineProperty: function (targetObject, name, def, defaultCfg) {
		if (Object.hasOwnProperty (targetObject, name)) {
			throw new Error ('_.defineProperty: targetObject already has property ' + name) }
		else {
			Object.defineProperty (targetObject, name,
				_.extend ({ enumerable: true }, defaultCfg, _.coerceToPropertyDefinition (def, name))) } },

	defineHiddenProperty: function (targetObject, name, def, defaultCfg) {
		return _.defineProperty (targetObject, name, def, _.extend ({ enumerable: false }, defaultCfg)) },

	defineMemoizedProperty: function (targetObject, name, def_, defaultCfg) {
		var def = _.coerceToPropertyDefinition (def_, name)
		return _.defineProperty (targetObject, name,
					_.extend ({}, def, {
						get: _.memoizeToThis ('_' + name, def.get) }), defaultCfg) },

	defineProperties: function (targetObject, properties) {
		_.each (properties, _.defineProperty.partial (targetObject).flip2) },

	memoizeToThis: function (name, fn) {
		return function () {
			var memo = this[name]
			return (memo !== undefined) ? memo : (this[name] = fn.call (this)) } },

	coerceToPropertyDefinition: function (value_, /* optional */ name) {
		var value = value_ || {}
		var actualValue = (typeof Tags === 'undefined') ? value_ : Tags.unwrap (value_)

				// property definition case (short circuit then)
		return	(!value.$constant && !value.$get && _.isPropertyDefinition (actualValue) && actualValue) ||

				// get-accessor-alone case
				((value.$get || (!value.$constant && _.isFunction (actualValue) && _.noArgs (actualValue))) &&
					{	get: actualValue,
						set: _.throwsError ('cannot change ' + (name || 'property') + ' (as it\'s an accessor function)') }) ||

				// constant value case
				(!value.$get && {	get: _.constant (actualValue),
									set: _.throwsError ('cannot change ' + (name || 'property') + ' (as it\'s sealed to ' + actualValue + ')') }) ||

				// any other case (erroneous)
				_.throwsError ('coerceToPropertyDefinition: crazy input, unable to match') () },

	isPropertyDefinition: function (obj) {
		return _.isObject (obj) && (_.isFunction (obj.get) || _.isFunction (obj.set)) },

	ownProperties: function (obj) {
		return (obj && _.pickKeys (obj, obj.hasOwnProperty.bind (obj))) || {} }  }) })


