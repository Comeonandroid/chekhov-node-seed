import _      from 'lodash'

import { User } from '../../models'

import token  from '../../utils/jwt_token'

export default class SessionController {

  static create(req, res, next) {
    User.findOne({ email: req.body.email }, (err, user) => {
      if (err) { return next(err) }
      if(!user) {
        const response = { message: 'Authentication failed. User not found.' }
        res.status(400).json({ success: false, data: response })    

      }else {
        if (!user.checkPassword(req.body.password)) {
          const response = { message: 'Authentication failed. Passwords did not match.' }
          res.status(400).json({ success: false, data: response })

        }else {
          let response = Object.assign(user.toObject(), { token: token.get(user)})
          res.json({ success: true, data: response })
        }
      }
    })
  }
  
}