var Moment = require('moment')
  , Readable = require('stream').Readable
  , rs = Readable({ encoding: 'utf8', objectMode: true })

module.exports = function(opts, next) {

  var _date

  if (typeof opts === 'function') {
    next = opts
    opts = null
  }
  if (! opts) opts = {}
  if (! opts.date) opts.date = Date.now()

  var flowing = ! opts.limit
    , limit = opts.limit || 1
    , hardLimit = Moment('1888-06-01')

  try {
    _date = Moment(opts.date)
    if (! _date.isValid())
      throw new Error('Invalid date')
  }
  catch(e) {
    _date = Moment()
  }

  var startDay
  if (opts.startDay) {
    try {
      startDay = Moment().day(opts.startDay).day()
      if (startDay < 0 || startDay > 6) throw new Error('Invalid start day')
    }
    catch(e) { startDay = 5 }
  }
  else
    startDay = 5		//default: Friday

  if (_date.day() < startDay)
    _date.subtract(7, 'days')

  _date.day(startDay)

  var stride = opts.stride || 1

  var format = opts.format || 'YYYY-MM-DD'
  if (_date.format(format) === 'Invalid date')
    next(new Error('unrecognized format: '+ format))

  if (! opts.exclude || ! Array.isArray(opts.exclude)) opts.exclude = []
  var exclude = opts.exclude.map(function(item) {
    return Moment().day(item).day()
  })

  rs._read = function() {
    while(exclude.indexOf(_date.day()) !== -1)
      _date.subtract(stride, 'days')

    rs.push(_date.format(format))
    limit--

    if (! flowing && limit < 1 || _date < hardLimit)
      rs.push(null)

    _date.subtract(stride, 'days')
  }

  next(null, rs)
}
