module.exports = function(args) {

  function usage() {
    var usage = 'Usage: node index.js [DATE] [OPTIONS]'+
      '\nDisplay a continuous stream of selected dates occuring before DATE.'+
      '\nIf DATE is omitted the current date is used as a starting point.'+
      '\n'+
      '\nOptions:'+
      '\n  --startDay=  select a day of the week to start from'+
      '\n  --limit=     count of how many previous dates to display'+
      '\n  --stride=    number of days to jump between iterations'+
      '\n  --exclude=   a list of days that you want to ignore'+
      '\n  --format=    a string describing the output format of dates'+
      '\n'+
      '\n  --help       display this help and exit'+
      '\n  --version    display version information and exit'+
      '\n';

    console.log(usage)
    process.exit()
  }

  function version() {
    console.log(require("./package.json").version)
    process.exit()
  }

  var _args = args
    , _opts = { string: ['f', 'format', 'e', 'exclude', 'startDay']
              , alias: {f: 'format', l: 'limit', e: 'exclude', s: 'stride', sd: 'startDay'} }
    , argv = require('minimist')(_args, _opts)
    , opts = {}

  opts.date = argv._[0] || null

  if (argv.format) opts.format = argv.format
  if (argv.limit > 0) opts.limit = argv.limit
  if (argv.exclude) opts.exclude = argv.exclude.split(',')
  if (argv.stride) opts.stride = 0 + argv.stride
  if (argv.startDay) opts.startDay = argv.startDay
  if (argv.help) usage()
  if (argv.version) version()

  return opts
}

