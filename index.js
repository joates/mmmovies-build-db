var app = require('./lib/app')

if (! module.parent) {
  app(require('./lib/cli')(process.argv.slice(2)), function(err, data) {
    if (err) throw err
    process.stdout.on('error', process.exit)
    data.pipe(process.stdout)
  })
}

module.exports = app
