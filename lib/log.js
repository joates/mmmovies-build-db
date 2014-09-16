var through2 = require('through2')
  , count = 0

module.exports = function(stream, next) {

  var transform = function(chunk, enc, cb) {

    if (! chunk) return cb(new Error('invalid chunk'))
    var movie = JSON.parse(chunk.toString().replace(/\n$/, ''))

    var num = ++count
    this.push((num < 10 ? '0' : '') + num +'| ++ '+ movie.Title +' ['+ movie.Year +']\n')

    // another chunk..
    cb()
  }

  var flush = function() {
    this.push(null)
  }

  next(null, stream.pipe(through2(transform, flush)))
}
