import express  from 'express'
import passport from 'passport'

import config   from '../config/index'

var router = express.Router();

import UsersRoute       from './routes/usersRoute'

// MIDLEWARES
router.use('/protected', passport.authenticate('jwt', config.get('jwtSession')))

UsersRoute(router)
PasswordRoute(router)
SessionsRoute(router)

module.exports = router
