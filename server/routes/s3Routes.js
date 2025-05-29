const express = require('express');
const s3Controller = require('../controllers/s3Controller');

const router = express.Router();


router.post('/presigned-upload-url', s3Controller.getPresignedUploadUrl);


module.exports = router;