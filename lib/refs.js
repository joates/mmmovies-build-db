var through2 = require('through2')
  , request = require('request')
  , fs = require('fs')
  , util = require('util')
  , stream = require('stream')
  , Duplex = stream.Duplex
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

module.exports = function(inStream, next) {

  function DuplexStream(src, opts) {

    if (! (this instanceof DuplexStream))
      return new DuplexStream(src, opts)

    Duplex.call(this, opts)

    var self = this
    this.buffer = []

    src.on('data', function(chunk) {
      self.buffer.push(chunk)
    })

    src.on('end', function(chunk) {
      if (chunk) self.buffer.push(chunk)
    })
  }
  util.inherits(DuplexStream, Duplex)

  DuplexStream.prototype._read = function(n) {
    if (this.buffer.length) this.push(this.buffer.shift())
  }

  DuplexStream.prototype._write = function(chunk, enc, cb) {
    console.log(chunk)
    cb()    
  }

  var transform = function(chunk, enc, cb) {

    if (! chunk) return cb(new Error('invalid chunk'))
    chunk = chunk.toString().replace(/\n$/, '')

    var _ws = this
      , yearMonth = chunk.substr(0, 7)
      , queryString = 'boxoffice_gross_us=1,&'+
                      'count=100&'+
                      'release_date='+ yearMonth +','+ yearMonth +'&'+
                      'sort=boxoffice_gross_us,desc&'+
                      'title_type=feature'

    var url = 'http://www.imdb.com/search/title?'+ queryString
      , cache_path = '../data/cache/.'+ yearMonth +'.dat'

    fs.exists(cache_path, function(use_cache) {

      if (use_cache) {

        // read from fs-cache
        fs.readFile(cache_path, function(err, file) {
          if (err) return next(err)

          var refs = parse_html(file)
          refs.forEach(function(item) {
            _ws.push(item +'\n')
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
              _ws.push(item +'\n')
            })

            // another chunk..
            cb()

          } else {
            if (! err)
              err = new Error('HTTP request bad status: ' + res.statusCode)
            return next(err)
          }

        // http request also stores a local copy in fs-cache
        }).pipe(fs.createWriteStream(cache_path))
      }

    })
  }

  var flush = function() {
    this.push(null)
  }

  var outStream = new DuplexStream(inStream)
  next(null, outStream.pipe(through2(transform, flush)))
}

