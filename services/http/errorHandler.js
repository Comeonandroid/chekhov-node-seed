var log  = require("../../utils/logger")(module);

module.exports = (err, req, res, next) => {

  log.error(`Web: ${err}`)

  res.statusCode = err.status || 400

  if(res.statusCode < 400) {
    res.statusCode = 500
  }

  let accept = req.headers.accept || 'application/json'

  if (accept.indexOf('json') != -1) {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ status: false, data: err }))
  }else {
    res.setHeader('Content-Type', 'text/plain')
    res.end(err.toString())
  }
}
