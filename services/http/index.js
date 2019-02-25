import morgan          from 'morgan'
import express         from 'express'
import cors            from 'cors'
import http            from 'http'
import session         from 'express-session'
import errorhandler    from 'errorhandler'
import passport        from 'passport'
import bodyParser      from 'body-parser'
import mongoose        from 'mongoose'
import fs              from 'fs'

import config from '../../config/index'

var MongoStore     = require('connect-mongo')(session)
let app            = express()
let server         = app.listen(process.env.PORT || 3001)

mongoose.Promise = global.Promise;
let db = mongoose.connect(config.get('mongoose:uri'), config.get('mongoose:options'))
mongoose.set('debug', true);

var mongoStore = new MongoStore({
    mongooseConnection: mongoose.connection,
    db: db.connection.db,
    url: db.url
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({credentials: true, origin: config.get('host')}))

if (process.env.NODE_ENV === 'development') {
  app.use(express.logger('dev'));
  app.use(errorhandler())
}

app.use(passport.initialize())
require("../auth")(passport)

var errorLogStream = fs.createWriteStream(__dirname + '/error.log', {flags: 'a'})

app.use(morgan('combined', {
  stream: errorLogStream,
  skip: (req,res) => {
    return res.statusCode < 400
  }
}))

app.use(session({
  secret: config.get('session:secret'),
  cookie: config.get('session:cookie'),
  resave: true,
  saveUninitialized: true,
  store: mongoStore
}))

app.use("/api", require("../../api"))

app.use(require("./errorHandler"))

module.exports.app = app
module.exports.server = server
