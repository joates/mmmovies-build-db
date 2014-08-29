var fm = require('flowing-moments')

module.exports = function(opts, next) {

  if (! opts) opts = {}

  // defaults
  opts.date = opts.date || Date.now()
  opts.startDay = 5
  opts.stride = 7

  fm(opts.date, opts, function(err, stream) {
    if (err) return next(err)
    next(null, stream)
  })
}
