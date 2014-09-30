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

    async.map([ 'fg', 'bg' ], http_get_img, function(err, results) {
      if (err) next(err)

      // Note: results is never used !!

      data = JSON.stringify(data) +'\n'
      _ws.push(data +'\n')

      // another chunk..
      cb()
    })

    function http_get_img(img, cb) {
      var img_path = '../data/cache/img/'+ movie_id +'_'+ img +'.jpg'

      fs.exists(img_path, function(is_cached) {
        if (is_cached) return cb(null, 0)

        var tmp, url

        if (img === 'fg') {
          tmp = data.tmdb_data.poster_path
          url = tmp ? 'http://image.tmdb.org/t/p/w300'+ tmp
                    : data.omdb_data.Poster
        } else {
          tmp = data.tmdb_data.backdrop_path
          url = tmp ? 'http://image.tmdb.org/t/p/w600'+ tmp : null
          if (! url) {
            fs.symlinkSync('bg.png', img_path)
            return cb(null, 0)
          }
        }

        if (url) {
          request(url, function (err, res, body) {
            if (! err && res.statusCode == 200) {
              return cb(null, 0)
            } else {
              if (! err)
                err = new Error('HTTP request bad status: ' + res.statusCode)
              return cb(err)
            }
          }).pipe(fs.createWriteStream(img_path))
        }
      })
    }
  }

  var flush = function() {
    this.push(null)
  }

  next(null, stream.pipe(through2(transform, flush)))
}

