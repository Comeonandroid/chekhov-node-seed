import _ from 'lodash'

import { User }   from '../../models'
import UserMailer from '../../notifers/userMailer'

export default class PasswordController {
  
  static async create(req, res, next) {
    User.findOne({ email: req.body.email }, async (err, user) => {
      if (err) { return next(err) }
      if(!user) {
        const response = { message: 'User not found' }
        res.status(400).json({ success: false, data: response })
      } else {
        const token = await user.updateResetPasswordToken()
        const response = { message: `Password reset link has been sent to ${user.email}` }
        
        UserMailer.resetPassword(user,token)        
        res.json({ success: true, data: response })
      }
    })
  }

  // TODO: Too huge. Move logic to model, use asyn/await
  static update(req, res, next) {
    const token = req.params.token

    if (token == null || token.length == 0) {
      res.status(400)
          .json({ success: false, data: { message: 'Token cannot be blank' } })
      return
    }
    //TODO: rewrite using try/catch
    User.getUserByResetToken(token, (err, user) => {
      if (err) { return next(err) }
      if(!user) {
        res.status(400)
          .json({ success: false, data: { message: 'Token is unvalid' } })
      }else {
        user.password = req.body.password
        user.save((err, user) => {
          if (err) { return next(err) }
          user.resetPasswordToken  = null
          user.resetPasswordSentAt = null
          user.save()
          let response = Object.assign(
            user.toObject(), 
            { message: 'Your password has been changed' }
          ) 
          res.json({
            success: true,
            data: response
          })
        })      
      }    
    })
  }

}