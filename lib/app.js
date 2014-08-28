var Pipeline = require('pipes-and-filters')

module.exports = function(args, cb) {

  Pipeline.create()
    .use(require('./dates'))
    .use(require('./refs'))
  //.use(require('./db-check'))
    .use(require('./data'))
    .use(require('./hash'))
    .use(require('./db-store'))
    .use(require('./log'))
    .execute(args, function(err, result) {
      if (err) return cb(err)
      cb(null, result)
    })
}