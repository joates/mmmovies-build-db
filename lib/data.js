var through2 = require('through2')
  , request = require('request')
  , extend = require('extend')
  , async = require('async')
  , fs = require('fs')
  , config = require('../config')

module.exports = function(stream, next) {

  var transform = function(chunk, enc, cb) {

    if (! chunk) return cb(new Error('invalid chunk'))
    chunk = chunk.toString().replace(/\n$/, '')

    var _ws = this
      , obj = null
      , cache_path = '../data/cache/.'+ chunk +'.dat'

    fs.exists(cache_path, function(is_cached) {

      if (is_cached) {
        load_cached_movie(chunk, function(err, data) {
          _ws.push(data)

          // again..
          cb()
        })
      } else {
        http_request_movie(chunk, function(err, data) {
          data = JSON.stringify(data) +'\n'
          _ws.push(data)

          fs.writeFile(cache_path, data, function (err) {
            if (err) throw err
            //console.log('It\'s saved!');
          })

          // again..
          cb()
        })
      }
    })
  }

  function load_cached_movie(id, _done) {
    var cache_path = '../data/cache/.'+ id +'.dat'
    
    fs.readFile(cache_path, function(err, file) {
      if (err) return _done(err)

      _done(null, file)
    })
  }

  function _get(url, _cb) {
      request(url, function (err, res, body) {
        if (! err && res.statusCode == 200) {
          return _cb(null, JSON.parse(body))
        } else {
          if (! err)
            err = new Error('HTTP request bad status: ' + res.statusCode)
          return _cb(err)
        }
      })
  }

  function http_request_movie(id, _done) {
    var omdb = 'http://www.omdbapi.com/?i='+ id
      , tmdb = 'https://api.themoviedb.org/3/movie/'
                 + id +'?api_key='+ config.api_key
      , imgs = 'https://api.themoviedb.org/3/movie/'
                 + id +'/images?api_key='+ config.api_key

    async.map([ omdb, tmdb, imgs ], _get, function(err, results) {
      var obj = {}
      results.forEach(function(item) {
        obj = extend(obj, item)
      })
      _done(null, obj)
    })
  }

  var flush = function() {
    this.push(null)
  }

  next(null, stream.pipe(through2(transform, flush)))
}
