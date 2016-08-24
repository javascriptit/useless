 module.exports = $trait ({

    beforeInit: function () { log.minor ('Setting up exception handling')

        _.withUncaughtExceptionHandler (this.$ (function (e) {

            if (!this.restarting) {
                log.writeUsingDefaultBackend ('\n', e) }  // Swallow errors if we're restarting (as they're expected)

            if (e.fatal) {
                log.e (log.boldLine + ' cannot continue ' + log.boldLine + '\n')
                process.exit () } })) } })