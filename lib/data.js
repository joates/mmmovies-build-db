var through2 = require('through2')
  , request = require('request')
  , fs = require('fs')

module.exports = function(stream, next) {

  var transform = function(chunk, enc, cb) {

    if (! chunk) return cb(new Error('invalid chunk'))
    chunk = chunk.toString().replace(/\n$/, '')

    var _ws  = this
      , url = 'http://www.omdbapi.com/?i='+ chunk
      , cache_path = '../data/cache/.'+ chunk +'.dat'

    fs.exists(cache_path, function(use_cache) {

      if (use_cache) {

        // read from fs-cache
        fs.readFile(cache_path, function(err, file) {
          if (err) return next(err)
        
          _ws.push(file +'\n')

          // another chunk..
          cb()
        })

      } else {

        // http-request
        request(url, function (err, res, body) {
          if (! err && res.statusCode == 200) {
            _ws.push(body +'\n')

            // another chunk..
            cb()

          } else {
            if (! err)
              err = new Error('HTTP request bad status: ' + res.statusCode)
            return next(err)
          }
        // http request also store local copy in fs-cache
        }).pipe(fs.createWriteStream(cache_path))
      }
    })
  }

  var flush = function() {
    this.push(null)
  }

  next(null, stream.pipe(through2(transform, flush)))
}
