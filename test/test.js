var test = require('tape')
  , concat = require('concat-stream')

/*
test('February 2008 has 5 fridays (cli)', function(t) {
  t.plan(2)

  var args = [ __dirname+'/../index.js',      '2008-02-29',
               '--limit=5',  '--startDay=5',  '--stride=7' ]
    , spawn = require('child_process').spawn
    , child = spawn('node', args)
    , result = ''

  child.stdout.setEncoding('utf8')

  child.stdout.on('data', function(chunk) {
    result += chunk.replace(/\n/g, ',')
  })

  child.stdout.on('close', function(code) {
    result = result.replace(/\,$/, '')
    t.equal(result.split(',').length, 5, 'output matches expected limit')
    t.equal(result, '2008-02-29,2008-02-22,2008-02-15,2008-02-08,2008-02-01', 'output compared to fixture')
  })
})

test('February 2008 has 5 fridays (module)', function(t) {
  t.plan(1)

  var opts = { limit:5, startDay:5, stride:7 }
  days('2008-02-29', opts, function(err, stream) {
    stream.setEncoding('utf8')
    var _write = concat(function(data) {
      //console.error(data +' / '+ data.toString())
      //t.equal(data.split(',').length, 5, 'output matches expected limit')
      t.equal(data.toString(), '2008-02-29,2008-02-22,2008-02-15,2008-02-08,2008-02-01', 'output compared to fixture')
      t.end()
    })
    stream.pipe(_write)

    var result = []
    stream.on('data', function(chunk) {
      chunk = chunk.replace(/\n/g, '')
      if (chunk) result.push(chunk)
      if (result.length === opts.limit) {
        t.equal(result.length, 5, 'output matches expected limit')
        t.equal(result.toString(), '2008-02-29,2008-02-22,2008-02-15,2008-02-08,2008-02-01', 'output compared to fixture')
        t.end()
      }
    })
  })
})
*/
