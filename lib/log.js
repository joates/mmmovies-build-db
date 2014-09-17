var through2 = require('through2')
  , count = 0

module.exports = function(stream, next) {

  var transform = function(chunk, enc, cb) {

    if (! chunk) return cb(new Error('invalid chunk'))
    var movie = JSON.parse(chunk.toString().replace(/\n$/, ''))
      , title = movie.omdb_data.Title
      , year  = movie.omdb_data.Year
      
    ++count
    var index = (count < 10 ? '   ' : (count < 100 ? '  ' : ' '))+ count
    this.push(index +'| ++ '+ title +' ['+ year +']\n')

    // another chunk..
    cb()
  }

  var flush = function() {
    this.push(null)
  }

  next(null, stream.pipe(through2(transform, flush)))
}
