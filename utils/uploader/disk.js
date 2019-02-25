import multer from 'multer'
import path   from 'path'

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, path.resolve(`${__dirname}/../static/uploads`))
    }
    ,
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});

module.exports = multer({ storage: storage })