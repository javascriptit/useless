var path        = require ('path'),
    fs          = require ('fs'),
    process     = require ('process'),
    http        = require ('http'),
    https       = require ('https'),
    crypto      = require ('crypto'),
    exec        = require ('child_process').exec,
    Buffer      = require ('buffer').Buffer,
    Iconv       = require ('iconv').Iconv,
    _           = require ('underscore'),
    jsStrEscape = require ('js-string-escape')

path.joins     = _.higherOrder (path.join)
path.joinWith  = _.flipN       (path.join)
path.joinsWith = _.higherOrder (path.joinWith)

_.tests.util = {

    'crypt': function () {
        var util    =  module.exports
        var options = { key: 'f00bAя' }
        var message = 'Hello world'
        var encrypted = util.encrypt (options, message)
        var decrypted = util.decrypt (options, encrypted)

        $assert (encrypted.length > 0)
        $assert (encrypted !== message)
        $assert (decrypted === message) } }

module.exports = {

    defaultCryptConfig: {
        key: null,
        algo: 'des-ede3-cbc',
        encoding: 'hex' },

    encrypt: function (cfg_, message) {
        var cfg = _.extend (module.exports.defaultCryptConfig, cfg_)
        var cipher = crypto.createCipher (cfg.algo, cfg.key)
        return cipher.update (message, 'utf8', cfg.encoding) + cipher.final (cfg.encoding) },

    decrypt: function (cfg_, message) {
        try {
            var cfg = _.extend (module.exports.defaultCryptConfig, cfg_)
            var cipher = crypto.createDecipher (cfg.algo, cfg.key)
            return cipher.update (message, cfg.encoding, 'utf8') + cipher.final ('utf8') }
        catch (e) {
            log.error (e)
            return undefined } },

    /*  Loaded modules are returned either as arguments:
            1. require (['esprima', 'escodegen'], function (esprima, escodegen) { })

        Or pushed to global namespace, if callback has no arguments:
            2. require (['esprima', 'escodegen'], function () { $assert (esprima !== undefined) })
     */
    require: function (names, then) {
        _.cps.map (names,
                function (name, i, return_) {
                    require.$ (name).catch_ (
                               function (e) {
                                    log.w ('Fetching', name, 'dependency from repository...')
                                    exec ('npm install ' + name, function (e, stdout, stderr) {
                                                                        if (e) {
                                                                            util.fatalError (stderr) }
                                                                        else {
                                                                            _.delay (function () {
                                                                                var module = require (name)
                                                                                if (module) {
                                                                                    log.ok ('Installed', name) }
                                                                                else {
                                                                                    log.error ('Install failed:', name) }
                                                                                return_ (module) }) } }) },
                                function (module) { if (module) {
                                                        log.info ('Loaded', name)
                                                        return_ (module) } }) },
                function (modules) {
                    if (_.noArgs (then)) {
                        _.each (modules, function (module, i) { $global[names[i]] = module }) }
                    then.apply (null, _.coerceToArray (modules)) }) },

    compileScript: function (cfg) { if (!cfg.source) {
                                    if (!cfg.sourceFile) { module.exports.fatalError ('no sourceFile specified') }
                                         cfg.source      = module.exports.readFile (cfg.sourceFile, cfg.includePaths) }

                        var read = function (what) { var file = module.exports.locateFile (what, cfg.includePaths)
                                                     return module.exports.compileScript ({
                                                                includePaths: _.cons (path.dirname (file), cfg.includePaths), 
                                                                source:       module.exports.readFile (file) }) }

                        var result = _.map (cfg.source.split ('\n'), function (line) {

                            var includeStrMatch = line.match (/^(.*)\$includeStr \(\'(.+)\'\)(.*)$/)
                            if (includeStrMatch) {
                                return includeStrMatch[1] + '\"' +
                                    jsStrEscape (read (includeStrMatch[2])) + '\"' + includeStrMatch[3] }

                            var moduleName = (line.match (/\$include \(\'(.+)\'\).*/) || [])[1]
                            if (moduleName) {
                                return line.match (/^\s*\/\/.*/) ? '' : (read (moduleName + '.js') + ';') }
                            else {
                                return line } }).join ('\n')

                        if (cfg.outputFile) {
                            util.writeFile (cfg.outputFile, result) }

                        return result },

    fatalError: function (explain) {
                    log.error.apply (null, _.cons (log.config ({ stackOffset: 1 }), _.asArray (arguments).concat ('\n')))
                    throw _.extend (new Error (_.asArray (arguments).join (' ')), { fatal: true, stackOffset: 1 }) },
                    
    lstatSync: function (dst) { // NOTE: replace with lstatSync.catches
                    try       { return fs.lstatSync (dst) }
                    catch (e) { return undefined } },

    parseCommandLineOptions: function (names) {
        var arguments     = _.rest (process.argv, 2)
        var options       = _.index (_.intersection (arguments, names))
        return {
            options: options,
            rest: _.without.apply (null, [arguments].concat (names)) } },

    locateFile: function (name, searchPaths) {
        return _.find (_.cons (name, (searchPaths || [process.cwd ()]).map (path.joinsWith (name).arity1)),
                        fs.lstatSync.catches (false, true)) || util.fatalError ('Unable to locate ' + name) },

    readFile: function (name, searchPaths) {
        return fs.readFileSync.catches (module.exports.fatalError.$ ('Cannot read', name)) (
                                        module.exports.locateFile (name, searchPaths), { encoding: 'utf-8' }) },

    writeFile: function (file) {
        return fs.writeFileSync.catches (module.exports.fatalError.$ ('Cannot write', file)) (file, { encoding: 'utf-8' }) },

    mkdir: function (dirPath, root_) {
        var dirs = dirPath.split ('/')
        var dir = dirs.shift ()
        var root = path.join ((root_ || ''), dir)
        try {
            fs.mkdirSync (root)
        } catch (e) {
            if (fs.statSync (root).isDirectory () !== true) {
                throw 'directory creation failed';
            }
        }
        return (dirs.length === 0 ? root : false) || module.exports.mkdir (dirs.join ('/'), root);
    },
    uniqueFileName: function (root, name, extension) {
        var n = 1, resultPath, resultName = name
        while (fs.existsSync (resultPath = path.join (root, resultName) + (extension ? ('.' + extension) : ''))) {
            resultName = name + '_' + (n++)
        }
        return resultName
    },
    httpGet_and_downloadFile_example: function () {
        util.httpGet ({
            path: '/',                  // URL part after the hostname
            host: 'www.cian.ru',        // if you encounter "getaddrinfo ENOTFOUND" error, probably your 'host' is not correct (DNS failure)
            port: 80,                   // 443 for HTTPS, any other (usually 80) for HTTP
            encoding: 'cp1251',         // default encoding is 'utf8' (if not explicitly set), other accepted values are 'cp1251' and 'binary'
            rejectUnauthorized: false,  // ignores SSL certificate errors (for HTTPS case)
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding': '',
                'Accept-Language': 'en-US,en;q=0.8,ru;q=0.6',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
                'Host': 'www.cian.ru',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.104 Safari/537.36'
            },
            success: function (data) { log.success ('httpGot', data) },
            failure: log.error
        })
        util.downloadFile ({
            overwrite: false, // if false, skips download if file already exists at 'dst' (default is true)
            dst: path.join (process.cwd (), 'static/photos/index.html'), // target path in file system
            src: {
                path: '/',
                host: 'cian.ru',
                port: 443,
                rejectUnauthorized: false, // ignores SSL certificate errors
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Encoding': '',
                    'Accept-Language': 'en-US,en;q=0.8,ru;q=0.6',
                    'Cache-Control': 'max-age=0',
                    'Connection': 'keep-alive',
                    'Host': 'cian.ru',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.104 Safari/537.36'
                }
            },
            success: function (dst) { log.success ('downloaded', dst) },
            failure: log.error
        })
    },
    readHttpResponse: function (encoding, then) {
        return function (response) {
            var data = ''
            response.setEncoding ((encoding == 'cp1251') ? 'binary' : (encoding || 'utf8'))
            response.on ('data', function (chunk) {
                data += chunk
            })
            response.on ('end', function() {
                switch (encoding) {
                    case 'cp1251':
                        then (new Iconv ('windows-1251', 'utf-8//IGNORE').convert (new Buffer (data, 'binary')).toString ()); break;
                    case 'binary':
                        then (new Buffer (data, 'binary')); break;
                    default:
                        then (data.toString (encoding)); break; } }) }
    },
    httpGet: function (cfg) {
        log.info ('httpGet:', cfg.host + cfg.path)
        var req = (cfg.port === 443 ? https : http).get (cfg, util.readHttpResponse (cfg.encoding, cfg.success))
        req.on ('error', cfg.failure)
    },
    downloadFile: function (cfg) {
        if (cfg.overwrite === false && fs.existsSync (cfg.dst)) {
            log.success ('downloadFile: already exists at', cfg.dst)
            cfg.success (cfg.dst)
        } else {
            log.warn ('downloadFile: downloading', cfg.src.path)
            var req = (cfg.src.port === 443 ? https : http).get (cfg.src, function (response) {
                util.writeRequestDataToFile (_.extend (_.pick (cfg, 'success', 'failure'), {
                    request: response,
                    filePath: cfg.dst
                }))
            })
            req.on ('error', function(err) {
                cfg.failure (err.message)
            })
        }
    },
    curl: function (url, complete) {
        exec ('curl  "' + url + '"', function (e, stdout, stderr) {
            // if (!e) {
            //  return stdout
            // }
            complete.call (this, e, stdout, stderr)
        })
    },
    writeRequestDataToFile: function (cfg) {
        /* configure writer */
        log.info ('Writing file ' + cfg.filePath)

        var bytesReceived = 0
        var allDataReceived = false
        var allDataWritten = true
        var fileStream = fs.createWriteStream (cfg.filePath, { encoding: 'binary' })
        var finalize = function () {
            fileStream.end ()
            cfg.success (cfg.filePath)
        }
        fileStream.addListener ('error', function (err) {
            log.error ('writeRequestDataToFile: error writing', cfg.filePath, ':', err)
            cfg.failure (err)
        })
        fileStream.addListener ('drain', function () {
            allDataWritten = true
            if (allDataReceived) {
                finalize ()
            } else {
                cfg.request.resume ()
            }
        })
        /* configure reader */
        cfg.request.on ('data', function (data) {
            var chunk = new Buffer (data, 'binary')
            console.log ('writing chunk of size ' + chunk.length)
            bytesReceived += chunk.length
            if (cfg.maxSize && (bytesReceived > cfg.maxSize)) {
                log.error ('writeRequestDataToFile: exceeded max file size, terminating')
                cfg.request.end ()
            } else {
                if (!(allDataWritten = fileStream.write (chunk, 'binary'))) {
                    cfg.request.pause ()
                }
            }
        })
        cfg.request.on ('end', function() {
            allDataReceived = true
            if (allDataWritten) {
                finalize ()
            }
        })
        cfg.request.resume ()
    }
}