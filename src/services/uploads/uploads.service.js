// Initializes the `upload` service on path `/uploads`
const createService = require('./uploads.class.js');
const hooks = require('./uploads.hooks');
const BlobService = require('feathers-blob');
const fs = require('fs-blob-store');
const multer = require('multer');
const store = require('s3-blob-store');
const AWS = require('aws-sdk');

module.exports = function () {
  const app = this;
  const multipartMiddleware = multer();
  
  const s3 = new AWS.S3({
    accessKeyId: app.get('awsAccessKey'),
    secretAccessKey: app.get('awsSecretKey'),
  });

  const blobStore = store({
    client: s3,
    bucket: 'offlinescreen/uploads'
  });


  // Initialize our service with any options it requires
  app.use('/uploads',
      multipartMiddleware.single('uri'),
      function(req,res,next){
          req.feathers.file = req.file;
          next();
      },
      BlobService({Model: blobStore})
  );

  const service = app.service('uploads');

  service.hooks(hooks);

};