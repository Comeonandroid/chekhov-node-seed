import Mailer from '../utils/mailer'
import path   from 'path'
import ejs    from 'ejs'
import moment from 'moment'

import config from '../config/index'

export default class UserMailer {

  static resetPassword(user, token, locals = {}){    
    let template_path = path.resolve(`${__dirname}/views/resetPassword.ejs`)    
    let mailer = new Mailer()
    const config = mailer.getConfig()
    ejs.renderFile(template_path, {user: user, token: token, config: config}, {}, function(err, str){
      mailer.sendMail(user.email,'Reset password',str)
    });    
  }

  static newRegistration(user, token, locals = {}){    
    let template_path = path.resolve(`${__dirname}/views/newRegistration.ejs`)    
    let mailer = new Mailer()
    const config = mailer.getConfig()
    ejs.renderFile(template_path, {user: user, token: token, config: config}, {}, function(err, str){
      mailer.sendMail(user.email,'Confirm your account',str)
    });    
  }  
}