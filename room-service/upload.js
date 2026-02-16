const multer = require("multer");
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');


const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    region: process.env.AWS_REGION || 'eu-west-1'
});

// const fileFilter = (req, file, cb) => {

//   if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' || file.mimetype == 'image/jpg') {
//     cb(null, true);
//   }
//   else {
//     cb(new Error("Invalid file type."), false);
//   }
  
//     // The function should call `cb` with a boolean
//   // to indicate if the file should be accepted
//   // To reject this file pass `false`, like so:
//   // To accept the file pass `true`, like so:
//   // You can always pass an error if something goes wrong:

// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads')
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//     cb(null, file.fieldname + '-' + uniqueSuffix)
//   }
// })

const storage = multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
    const prefix = Date.now() + '-' + Math.round(Math.random() * 1E2)
    cb(null, file.fieldname + '-' + prefix)
    }
})

const upload = multer({ storage: storage })

module.exports = upload;