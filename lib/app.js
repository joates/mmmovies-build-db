var Pipeline = require('pipes-and-filters')

module.exports = function(args, cb) {

  Pipeline.create()
    .use(require('./dates'))
    .use(require('./refs'))		// full month of new releases
  //.use(require('./db-check'))
    .use(require('./import'))
    .use(require('./hash'))
    .use(require('./validate'))
    .use(require('./fs-store'))
  //.use(require('./db-store'))
    .use(require('./log'))
    .execute(args, function(err, result) {
      if (err) return cb(err)
      cb(null, result)
    })
}
