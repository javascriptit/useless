_.withUncaughtExceptionHandler (function (e) {
	UI.error (e, undefined, _.identity) }) // bind UI.error as default unhandled exception handler

$(document).ready (function () {
	
	// conditional css
	$('html').addClass (_.platform ().system)
	$('html').addClass (_.platform ().device)

	// somehow on iPad whole page gets scrolled by ~20px down on load
	$(document.body).scrollTop (0)

	// disables momentum scrolling for whole page (really nasty thing)
	/*$(document).on ('touchmove', function (e) {
		if ($(e.target).css ('-webkit-overflow-scrolling') != 'touch') { // allow scrolling for scrollable elements
			e.preventDefault ()
		}
	})*/

	$(document).scroll (function () {
		_.delay (function () {
			var focusGuys = $('input:focus, textarea:focus')
			if (!focusGuys.length) { // if some input is not in focus (screen-slide behavior)
				$(document.body).scrollTop (0) // don't allow this shit (fallback case when ontouchmove prevention fails)
			} else {
				focusGuys.one ('blur', function () {
					$(document.body).scrollTop (0) /* scroll back ASAP */ }) } }, 100) })

	// force 3D acceleration for whole page
	document.body.style.webkitTransform = 'translate3d(0,0,0)' })