var through2 = require('through2')
  , sublevel = require('level-sublevel')
  , opts = { valueEncoding: 'json' }
  , db  = sublevel(require('level')('../data/db/mmmovies-alpha1', opts))
  , idx = db.sublevel('title_year')
  , idx_key = require('./idx-key')

db.pre(function(op, add) {
  add({
    key: idx_key(op.value.Title, op.value.Year) +'!'+ op.key,
    value: ' ',
    prefix: idx
  })
})

module.exports = function(stream, next) {

  var transform = function(chunk, enc, cb) {

    var data = JSON.parse(chunk)
      , key = data.imdbID
      , _ws = this

    db.put(key, data, function(err) {
      if (err) return next(err)

      _ws.push(key +' '+ data.Title +' ['+ data.Year +']')

      // again..
      cb()
    })
  }

  var flush = function() {
    db.close(function(err) { if (err) return next(err) })
    this.push(null)
  }

  next(null, stream.pipe(through2(transform, flush)))
}
