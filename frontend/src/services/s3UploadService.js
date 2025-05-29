import apiClient from '../api/userService'; // Your main axios instance

export const getS3PresignedUrl = async (fileName, fileType, userId) => {
  try {
    const response = await apiClient.post('/s3/presigned-upload-url', {
      fileName,
      fileType,
      userId
    });
    return response.data; // { uploadUrl, objectUrl, objectKey }
  } catch (error) {
    console.error("Error getting S3 pre-signed URL:", error);
    throw error.response?.data || new Error("Failed to get S3 upload URL");
  }
};

export const uploadFileToS3 = async (presignedUrl, file) => {
  try {
    
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type, // Make sure this matches the type used to generate the presigned URL
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`S3 upload failed: ${response.status} ${errorText}`);
    }
    // If successful, the file is now on S3. The final URL is already known from getS3PresignedUrl (objectUrl).
    return true; 
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};