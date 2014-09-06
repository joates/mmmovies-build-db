var fm = require('flowing-moments')

module.exports = function(opts, next) {

  if (! opts) opts = {}
  opts.date = opts.date || Date.now()

  fm(opts.date, opts, function(err, stream) {
    if (err) return next(err)
    next(null, stream)
  })
}
