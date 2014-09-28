var through2 = require('through2')

module.exports = function(stream, next) {

  var transform = function(chunk, enc, cb) {

    if (! chunk) return cb(new Error('invalid chunk'))
    chunk = chunk.toString().replace(/\n$/, '')

    try {
      var data = JSON.parse(chunk)
    } catch (err) {
      return next(err)
    }

    for (var key in data) {
      if (key === 'omdb_data') {
        for (var child in data[key]) {
          if (! data[key][child] || data[key][child] === 'N/A') {
            switch (child) {
              case 'Runtime':
              case 'Metascore':
              case 'imdbRating':
              case 'imdbVotes':
                data[key][child] = 0
                break
            }
          }
          if (child === 'Hash') {
            data[key]['Hash_omdb'] = data[key][child]
            delete data[key]['Hash']
          }
        }
      }

      if (key === 'tmdb_data') {
        for (var child in data[key]) {
          switch (child) {
            case 'release_date':
              data['custom'] = {}
              data['custom']['yyyymm'] = data[key][child].substr(0, 7).replace('-', '')
              break
            case 'runtime':
              data[key]['runtime_'] = parseInt(data[key][child], 10)
              delete data[key][child]
              break
            case 'title':
              data[key]['title_'] = data[key][child].toString()
              delete data[key][child]
              break
          }
          if (child === 'Hash') {
            data[key]['Hash_tmdb'] = data[key][child]
            delete data[key]['Hash']
          }
        }
      }
    }

    data = JSON.stringify(data)
    this.push(data +'\n')

    // another chunk..
    cb()
  }

  var flush = function() {
    this.push(null)
  }

  next(null, stream.pipe(through2(transform, flush)))
}

