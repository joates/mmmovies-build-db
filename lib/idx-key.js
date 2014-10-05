module.exports = function(title, year) {
  title = title.toLowerCase()
               .replace(/\s+|[^a-zA-Z0-9]+/g, '-')
             //.replace(/\-+/g, '.')
             //.replace(/^(the)\.(.*)$/, '$2.$1')
               .replace(/\-+/g, '')
               .replace(/^(the)(.*)$/, '$2$1')
             //title += '_' + year
  return title += year
}

