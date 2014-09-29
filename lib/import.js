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

    var tmp = chunk.replace(/["{}]/g, '').split(':')
      , id  = tmp[0]
      , rev = tmp[1]

    tmp = null

    var _ws = this
      , cache_path = '../data/cache/.'+ id +'.dat'

    fs.exists(cache_path, function(is_cached) {

      if (is_cached) {
        load_cached_movie(id, function(err, data) {
          _ws.push(data)

          // again..
          cb()
        })
      } else {
        http_request_movie(id, function(err, data) {
          data['custom'] = {}
          data['custom']['boxoffice'] = rev
          data = JSON.stringify(data) +'\n'
          _ws.push(data)

          // again..
          cb()
        })
      }
    })
  }

  function load_cached_movie(id, done) {
    var cache_path = '../data/cache/.'+ id +'.dat'
    
    fs.readFile(cache_path, function(err, file) {
      if (err) return done(err)

      done(null, file)
    })
  }

  function _get(url, _cb) {
    request(url, function (err, res, body) {
      if (! err && res.statusCode == 200) {
        return _cb(null, JSON.parse(body))
      } else if (! err && res.statusCode == 404) {
        return _cb(null, { /*'response': false*/ })
      } else {
        err = new Error('HTTP error ' + res.statusCode +': '+ url)
        return _cb(err)
      }
    })
  }

  function http_request_movie(id, done) {
    var omdb = 'http://www.omdbapi.com/?i='+ id
      , tmdb = 'https://api.themoviedb.org/3/movie/'
                 + id +'?api_key='+ config.api_key
      , imgs = 'https://api.themoviedb.org/3/movie/'
                 + id +'/images?api_key='+ config.api_key

    async.map([ omdb, tmdb, imgs ], _get, function(err, results) {
      if (err) next(err)
      var obj = {}
        , keys = [ 'omdb_data', 'tmdb_data', 'tmdb_imgs' ]
      results.forEach(function(item, idx) {
        var nested_obj = {}
        nested_obj[ keys[idx] ] = item
        extend(obj, nested_obj)
      })
      done(null, obj)
    })
  }

  var flush = function() {
    this.push(null)
  }

  next(null, stream.pipe(through2(transform, flush)))
}
