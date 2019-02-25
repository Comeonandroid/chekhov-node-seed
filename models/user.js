import mongoose, { Schema } from 'mongoose'
import validate from 'mongoose-validator'
import uniqueValidator from 'mongoose-unique-validator'
import crypto from 'crypto'

import { BadRequestException } from '../utils/exceptions'

var schemaOptions = {
  toObject: {
    virtuals: true
  },toJSON: {
    virtuals: true
  }
}

var User = new Schema({
  email:
  {
    type: String,
    unique: true,
    required: true
  },
  firstname:
  {
    type: String, 
    required: true,
  },
  lastname:
  {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  area: {
    type: Array
  },  
  company: { 
    type : mongoose.Schema.Types.ObjectId, 
    ref: 'Company'    
  },
  role: {
    type: String,
    enum: ['admin','lawyer','client'],
    default: 'lawyer'
  },
  hashedPassword:
  {
    type: String,
    required: true
  },
  salt:
  {
    type: String,
    required: true
  },
  socialId:
  {
    type: String
  },
  resetPasswordToken:
  {
    type: String
  },
  resetPasswordSentAt:
  {
    type: Date
  },
  inviteToken:
  {
    type: String
  },
  confirmationToken:
  {
    type: String
  },
  confirmedAt: {
    type: Date,
    default: null
  },
  created_at:
  {
    type: Date,
    default: Date.now
  }
}, schemaOptions)

User.plugin(uniqueValidator, { message: '{PATH} is already used.' })

User.virtual('notificationRoom').get(function(){
  return 'user_' + this._id
})

User.virtual('password').set(function(password){
  this._plainPassword = password
  this.salt = Math.random() + ''
  this.hashedPassword = this.encryptPassword(password)
}).get(function() {
  this._plainPassword
})

User.virtual('confirmed')
    .set(function(val) {
      if(val) {
        this.confirmedAt = Date.now()
      } else {
        this.confirmedAt = null
      }
      })
    .get(function() { return this.confirmedAt != null ? true : false });

User.virtual('fullname')
    .set(function(fullname) {
        let names = fullname.split(" ")
        if (names.length < 2) { return false }
        this.firstname = names[0];
        this.lastname  = names[1];
    })
    .get(function() { return this.firstname + ' ' + this.lastname; });

User.virtual('notificationRoom').get(function(){
  return 'user_' + this._id
})

User.methods.encryptPassword = function(password) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex')
}

User.methods.checkPassword = function(password){
  if(!password || password == undefined){
     return false
  }else{
    return this.encryptPassword(password) == this.hashedPassword
  }
}

User.methods.updatePassword = async function(password, passwordConfirmation) {
  if (password.length === 0) {
    throw new BadRequestException('Password cannot be blank')
  }

  if (password !== passwordConfirmation) {
    throw new BadRequestException('Passwords do not match')
  }

  this.password = password
  await this.save()
}

User.methods.updateResetPasswordToken = async function() {
  return new Promise((resolve, reject) => {
    const now = new Date().getTime()
    const token = crypto.randomBytes(48).toString('hex')

    this.resetPasswordToken  = token
    this.resetPasswordSentAt = now
    this.save((err, user)=>{
      if(err){ reject(err) }
      resolve(user.resetPasswordToken)
    })
  })
}

User.statics.createNewUser = async function(params){
  let user = new this(params)
  user.confirmationToken = crypto.randomBytes(48).toString('hex')

  return await user.save()
}

User.methods.updateConfirmationToken = async function() {
  const token = crypto.randomBytes(48).toString('hex')
  this.confirmationToken = token

  return await this.save()
}

User.statics.findOrCreateSocial = async function(data){
  const user_params = {
    socialId: data.user_id,
    email: data.email,
    firstname: data.given_name,
    lastname: data.family_name,
    password: crypto.randomBytes(48).toString('hex'),
    confirmedAt: new Date().getTime()
  }
  
  const user = await this.findOne({socialId: user_params.user_id})
  if(user){ 
    return user
  } else {
    let new_user = new this(user_params)
    return await new_user.save()
  }     
}

User.statics.getUserByResetToken = function(token, cb) {
  return this.findOne({ resetPasswordToken: token }).exec(cb);
}

User.statics.getUserByConfirmationToken = async function(token) {
  return this.findOne({ confirmationToken: token });
}

export default mongoose.model('User', User)
