var through2 = require('through2')
  , request = require('request')
  , fs = require('fs')
  , id_cache = {}

function parse_html(data) {
  var re = /"\/title\/(tt[0-9]+)\/"/g
    , ret = []

  while (res = re.exec(data)) {
    var val = res[1]
    if (! id_cache[val]) {
      ret.push(val)
      id_cache[val] = true
    }
  }

  return ret
}

module.exports = function(stream, next) {

  var transform = function(chunk, enc, cb) {

    var _ws = this
      , url = 'http://www.imdb.com/boxoffice/?region=us&date='+ chunk
      , cache_path = '../data/cache/.'+ chunk +'.dat'

    fs.exists(cache_path, function(use_cache) {

      if (use_cache) {

        // read from fs-cache
        fs.readFile(cache_path, function(err, file) {
          if (err) return next(err)
        
          var refs = parse_html(file)
          refs.forEach(function(item) {
            _ws.push(item)
          })

          // another chunk..
          cb()
        })

      } else {

        // http-request
        request(url, function (err, res, body) {

          if (! err && res.statusCode == 200) {

            var refs = parse_html(body)
            refs.forEach(function(item) {
              _ws.push(item)
            })

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
