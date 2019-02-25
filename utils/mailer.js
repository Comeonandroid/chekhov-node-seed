import mailcomposer from 'mailcomposer'

import config from "../config/index"
var logger = require('./logger')(module)

export default class Mailer {
  constructor(){
    let api_key = config.get('mailer:apiKey');
    let domain  = config.get('mailer:domain');
    this.mailer = require('mailgun-js')({apiKey: api_key, domain: domain});
  }

  sendMail(to,subject,html, locals = {}){
    let mail = mailcomposer({
      from: 'Example <'+config.get('mailer:fromEmail')+'>',
      to: to,
      subject: subject,
      html: html
    });
    console.log('mail html',html)
    mail.build((mailBuildError, message) => { 
      var dataToSend = {
        to: to,
        message: message.toString('ascii')
      };     
      this.mailer.messages().sendMime(dataToSend, function (error, body) {
        if(error){
          logger.error("Error with mailer "+ error.message)
        }
        console.log('mail error',body)
      });
    });
  }

  getConfig(){
    return {
      host: config.get('mailer:host'),
      fromEmail: config.get('mailer:fromEmail')
    }
  }
}