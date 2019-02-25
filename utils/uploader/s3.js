var AWS      = require('aws-sdk')
var multer   = require('multer')
var path     = require('path')
var multerS3 = require('multer-s3')

AWS.config.loadFromPath(path.resolve(__dirname,'../../config/aws.json'));
var s3 = new AWS.S3({})
//TODO: S3 permissions, privacy
 
module.exports = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'example',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      var datetimestamp = Date.now();
      cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
  })
})