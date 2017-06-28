// Initializes the `upload` service on path `/uploads`
const createService = require('./uploads.class.js');
const hooks = require('./uploads.hooks');
const blobService = require('feathers-blob');
const fs = require('fs-blob-store');
const multer = require('multer');

module.exports = function () {
  const app = this;
  const multipartMiddleware = multer();
  const blobStorage = fs(app.get('public') + '/uploads');

  // Initialize our service with any options it requires
  app.use('/uploads',
      multipartMiddleware.single('uri'),
      function(req,res,next){
          req.feathers.file = req.file;
          next();
      },
      blobService({Model: blobStorage})
  );

  const service = app.service('uploads');

  service.hooks(hooks);

};
