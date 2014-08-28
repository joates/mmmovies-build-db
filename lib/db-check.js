var through2 = require('through2')

module.exports = function(stream, next) {

  var transform = function(chunk, enc, cb) {

    var key = '!!'+ chunk
      ,_ws = this

    db.get(key, function(err, value) {
      if (err) {
        if (err.type = 'NotFoundError') {
          // keys which don't already exist are
          // the ones we want to add to the database
          _ws.push(chunk)
        }
      }
    })

    // again..
    cb()
  }

  var flush = function() {
    this.push(null)
  }

  next(null, stream.pipe(through2(transform, flush)))
}
