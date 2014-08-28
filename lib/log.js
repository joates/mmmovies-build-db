var through2 = require('through2')
  , count = 0

module.exports = function(stream, next) {

  var transform = function(chunk, enc, cb) {

    var num = ++count
    this.push((num < 10 ? '0' : '') + num +'| ++ '+ chunk +'\n')

    // another chunk..
    cb()
  }

  var flush = function() {
    this.push(null)
  }

  next(null, stream.pipe(through2(transform, flush)))
}
