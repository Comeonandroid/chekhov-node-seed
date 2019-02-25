import _      from 'lodash'

import { User, Company, Invite }   from '../../models'
import UserMailer from '../../notifers/userMailer'
import { AuthenticationClient } from 'auth0'
import { BadRequestException, NotAuthorizedException, ForbiddenException } from '../../utils/exceptions'

import token  from '../../utils/jwt_token'
import config from '../../config/index'

export default class UserController {
  
  static get(req, res, next) {
    let params = {}
    User.find(params, (err, users) => {
        if (err) { return next(err) }

        if (!users || users.length < 1) {
          const response = { message: 'Users not found' }
          res.json({ success: false, data: response})
        }else {
          res.json({ success: true, data: users })
        }
      }
    )
  }

  static current_user(req, res, next) {
    res.json({ data: req.user })
  }

  static show(req, res,next) {
    User.findOne({ _id: req.params.id }, (err, user) => {
      if (err) { return next(err) }
      if (user) {
        res.json({ success: true, data: user })
      }else {
        res.json({ success: false, message: 'User not found'
        })
      }
    })  
  }

  static async create(req, res, next) {
    const params = _.pick(req.body, 
      'firstname', 'lastname', 'email', 
      'password', 'inviteToken'
    )

    try {
      const user = await User.createNewUser(params)
      UserMailer.newRegistration(user,user.confirmationToken)
      if(user.inviteToken){
        let invite = await Invite.findOne({email: user.email, token: user.inviteToken, active: true})
        if(invite){
          let company = await Company.findById(invite.company)
          company.acceptInvite(invite)
        }
      } else {
        // Create default company for tests
        let company = await Company.createDefault()
        await company.addMember(user)
      }
      const response = Object.assign(user.toObject(), { 
        token: token.get(user)
      })  
      res.json({success: true, data: response})

    } catch(e) {
      e.message = 'There was problem when create User'
      next(e)
    }
  }

  static async update(req, res, next) {
    const current_user = req.user
    const id = req.params.id 

    const params = _.pick(req.body, 
      'firstname', 'lastname', 'city',
      'state', 'area', 'avatar'
    )

    try {      
      // At this moment usen can only change his own profile
      if(id.toString() != current_user._id.toString()) {
        throw new ForbiddenException("You can't change the user")
      }
      
      const user = await User.findOneAndUpdate(
        { _id: id }, params, { new: true }
      )

      res.json({ success: true, data: user })
    } catch(e) {
      next(e)
    }
  }

  static async updatePassword(req, res, next) {
    let current_user = req.user
    const params = _.pick(req.body, 
      'password', 'newPassword', 'passwordConfirmation'
    )
    try {
      if(!current_user.checkPassword(params['password'])){
        throw new BadRequestException('Your old password is not valid') 
      }

      await current_user.updatePassword(params['newPassword'],params['passwordConfirmation'])
      let response = Object.assign(current_user.toObject(), { message: "Your password has been updated" })
      res.json({success: true, data: response})
    } catch(e) {
      next(e)
    }
  }
  
  static async socialLogin(req,res,next) {
    const access_token = req.body.token
    var auth0 = new AuthenticationClient({
      domain: config.get('auth0:domain'),
      scope: 'openid profile',      
      clientId: config.get('auth0:clientId')
    });
    
    auth0.getProfile(access_token, async (err, userJson) => {
      try {
        if(userJson != 'Unauthorized') {
          const userInfo = JSON.parse(userJson)
          const email    = userInfo.email
          let user     = await User.findOne({email: email})
          if(!user){
            user = await User.findOrCreateSocial(userInfo)
            //Create default company for tests
            let company = await Company.createDefault()
            await company.addMember(user)            
          }
          let response = Object.assign(user.toObject(), { token: token.get(user)})
          res.json({ success: true, data: response })
        } else {
          throw new NotAuthorizedException('Authentication failed. User not found.')
        }
      } catch(e) {
        next(e)
      }  
    });
  }

  static async confirm(req,res,next) {
    const token = req.params.token
    try {    
      if (token == null || token.length == 0) {
        throw new BadRequestException('Token cannot be blank')
      }
      let user = await User.getUserByConfirmationToken(token)
      if(!user) {
        throw new NotAuthorizedException('Token is unvalid')
      }else {
        user.confirmed = true
        user = await user.save()
        let response = Object.assign(
          user.toObject(), 
          { message: 'Your account has been confirmed' }
        ) 
        res.json({ success: true, data: response })     
      }
    } catch(e){
      next(e)
    }  
  }
}
