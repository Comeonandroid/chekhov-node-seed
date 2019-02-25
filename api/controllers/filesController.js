var upload = require('../../utils/uploader/s3').single('file');

import { File } from '../../models'

export default class FilesController {
  
  static async create(req,res,next) {
    upload(req, res, (err) => {
      const file = req.file
      if(file){
        const saved_file = File.saveFile(file)
        res.json({success: true, data: saved_file})
      } else {
        res.status(400).json({success: false, data: {}})
      }
    })
  }
  
}