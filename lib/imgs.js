var through2 = require('through2')
  , request = require('request')
  , async = require('async')
  , fs = require('fs')

module.exports = function(stream, next) {

  var transform = function(chunk, enc, cb) {
      
    var _ws = this

    if (! chunk) return cb(new Error('invalid chunk'))
    chunk = chunk.toString().replace(/\n$/, '')
    
    try {
      var data = JSON.parse(chunk)
    } catch (err) {
      return next(err)
    }
    var movie_id = data.omdb_data.imdbID

    async.map([ '_fg', '_bg' ], http_get_img, function(err, results) {
      if (err) next(err)

      /*  // display results
      var sum = results[0] + results[1]
      if (sum < 0)
        console.log('         /images not found/')
      if (sum > 1)
        console.log('         /images stored OK/')
      */

      data = JSON.stringify(data) +'\n'
      _ws.push(data +'\n')

      // another chunk..
      cb()
    })

    function http_get_img(img, cb) {
      var img_path = '../data/cache/img/'+ movie_id + img +'.jpg'

      fs.exists(img_path, function(is_cached) {
        if (is_cached) return cb(null, 0)

        if (! data.tmdb_data.poster_path)
          return cb(null, -1)
        if (! data.tmdb_data.backdrop_path)
          return cb(null, -1)

        var size = img === '_fg' ? '300' : '600'
          , file = img === '_fg' ? data.tmdb_data.poster_path
                                 : data.tmdb_data.backdrop_path
          , url = 'http://image.tmdb.org/t/p/w'+ size + file

        if (! file) return cb(null, -1)

        request(url, function (err, res, body) {
          if (! err && res.statusCode == 200) {
            return cb(null, 2)
          } else {
            if (! err)
              err = new Error('HTTP request bad status: ' + res.statusCode)
            return cb(err)
          }
        }).pipe(fs.createWriteStream(img_path))
      })
    }
  }

  var flush = function() {
    this.push(null)
  }

  next(null, stream.pipe(through2(transform, flush)))
}

