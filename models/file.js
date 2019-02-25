import mongoose, { Schema } from 'mongoose'
import validate from 'mongoose-validator'
import crypto   from 'crypto'

var schemaOptions = {
  toObject: {
    virtuals: true
  },toJSON: {
    virtuals: true
  }
}

var File = new Schema({
  originalname: {
    type: String
  },
  name: {
    type: String
  },
  file: {
    type: String,
    required: true
  },
  key: {
    type: String
  },
  mimetype: {
    type: String
  },
  size: {
    type: Number
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

File.statics.saveFile = function(params) {
  const name = params.originalname || params.key
  const file = new this({
    originalname: params.originalname,
    file: params.location,
    key: params.key,
    name: name,
    mimetype: params.mimetype,
    size: params.size
  })
  file.save()
  return file
}

export default mongoose.model('File', File)