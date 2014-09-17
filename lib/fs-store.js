var through2 = require('through2')
  , fs = require('fs')

module.exports = function(stream, next) {

  var transform = function(chunk, enc, cb) {
      
    if (! chunk) return cb(new Error('invalid chunk'))
    chunk = chunk.toString().replace(/\n$/, '')
    
    try {
      var data = JSON.parse(chunk)
    } catch (err) {
      return next(err)
    }

    var movie_id = data.omdb_data.imdbID
      , cache_path = '../data/cache/.'+ movie_id +'.dat'
    data = JSON.stringify(data) +'\n'

    fs.exists(cache_path, function(is_cached) {
      if (! is_cached) {
        fs.writeFile(cache_path, data, function (err) {
         if (err) return next(err)
          // file written to cache OK
        })
      }
    })

    this.push(data +'\n')

    // another chunk..
    cb()
  }

  var flush = function() {
    this.push(null)
  }

  next(null, stream.pipe(through2(transform, flush)))
}

