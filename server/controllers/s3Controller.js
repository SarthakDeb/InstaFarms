const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { s3Client, BUCKET_NAME } = require('../config/s3Client');
const crypto = require('crypto'); // For generating unique filenames

exports.getPresignedUploadUrl = async (req, res) => {
  const { fileName, fileType, userId } = req.body;

  if (!fileName || !fileType || !userId) {
    return res.status(400).json({ error: 'fileName, fileType, and userId are required.' });
  }

  // Sanitize and create a unique object key
  const randomSuffix = crypto.randomBytes(8).toString('hex');
  const extension = fileName.split('.').pop();
  const objectKey = `profileImages/${userId}/${Date.now()}-${randomSuffix}.${extension}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: objectKey,
    ContentType: fileType,
  };

  try {
    const command = new PutObjectCommand(params);
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // URL expires in 5 minutes

    
    const finalObjectUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${objectKey}`;
    
    res.status(200).json({
      uploadUrl: signedUrl, // URL for frontend to PUT the file to
      objectUrl: finalObjectUrl, // URL to store in DB after upload is successful
      objectKey: objectKey // Key for potential direct reference or deletion
    });
  } catch (error) {
    console.error('Error creating pre-signed URL:', error);
    res.status(500).json({ error: 'Failed to create pre-signed URL.' });
  }
};

exports.deleteS3Object = async (objectKey) => { // Helper function, not an endpoint itself here
    if (!objectKey) return;
    const params = {
        Bucket: BUCKET_NAME,
        Key: objectKey,
    };
    try {
        const command = new DeleteObjectCommand(params);
        await s3Client.send(command);
        console.log(`Successfully deleted ${objectKey} from S3.`);
    } catch (error) {
        console.error(`Error deleting ${objectKey} from S3:`, error);
    }
};