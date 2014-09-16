var through2 = require('through2')
  , crypto = require('crypto')
  , extend = require('extend')
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

    var hashes = {}
      , movie_id = null

    for (var key in data) {
      if (! data[key].Hash) {
        var movie = extend({}, data[key])

        if (movie.imdbID && movie_id !== movie.imdbID)
          movie_id = movie.imdbID

        var hash = hashes[movie_id +'_'+ key] = crypto.createHash('sha1')
        hash.update(JSON.stringify(movie))

        var shasum = hash.digest('hex')
        data[key].Hash = shasum
      }
    }

    if (! movie_id)
      movie_id = data.omdb_data.imdbID

    var cache_path = '../data/cache/.'+ movie_id +'.dat'
    data = JSON.stringify(data) +'\n'
    hashes = null

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
