module.exports = function(title, year) {
  title = title.toLowerCase()
               .replace(/\s+/g, "-")
               .replace(/[^a-zA-Z0-9\-]+/g, "")
               .replace(/^(the)-(.*)$/, "$2-($1)")
  title += '_' + year +''
  return title
}
