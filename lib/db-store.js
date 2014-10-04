var through2 = require('through2')
  , fs = require('fs')
  , sublevel = require('level-sublevel')
  , opts = { valueEncoding: 'json' }
  , db  = sublevel(require('level')('../data/db/movies', opts))
  , idx = db.sublevel('title_year')
  , idx_key = require('./idx-key')

db.pre(function(op, add) {
  add({
    key: idx_key(op.value.omdb_data.Title, op.value.omdb_data.Year) +'!'+ op.key,
    value: ' ',
    prefix: idx
  })
})

module.exports = function(stream, next) {

  var transform = function(chunk, enc, cb) {
      
    if (! chunk) return cb(new Error('invalid chunk'))
    chunk = chunk.toString().replace(/\n$/, '')
    
    try {
      var data = JSON.parse(chunk)
    } catch (err) {
      return next(err)
    }

    var key = data.omdb_data.imdbID
      , _ws = this

    db.put(key, data, function(err) {
      if (err) return next(err)

      _ws.push(JSON.stringify(data) +'\n')

      // another chunk..
      cb()
    })
  }

  var flush = function() {
    db.close(function(err) { if (err) return next(err) })
    this.push(null)
  }

  next(null, stream.pipe(through2(transform, flush)))
}

