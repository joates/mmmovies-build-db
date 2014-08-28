var through2 = require('through2')
  , crypto = require('crypto')

module.exports = function(stream, next) {

  var transform = function(chunk, enc, cb) {

    try {
      var data = JSON.parse(chunk)
    } catch (err) {
      return next(err)
    }

    var hash = crypto.createHash('sha1')
    hash.update(chunk)
    data.Hash = hash.digest('hex')

    delete(data.Response)  // not needed after hashing operation
    this.push(JSON.stringify(data))

    // another chunk..
    cb()
  }

  var flush = function() {
    this.push(null)
  }

  next(null, stream.pipe(through2(transform, flush)))
}
