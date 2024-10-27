// s3Service.ts

import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const s3Client = new S3Client({
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
});

// Generate a pre-signed URL for retrieving an object from S3
export const getS3SignedUrl = async (imageKey: string): Promise<string | null> => {
    try {
        const params = {
            Bucket: process.env.S3_BUCKET_NAME!, // Ensure the environment variable is correctly set
            Key: imageKey,
        };

        // Create the command for getting the object
        const command = new GetObjectCommand(params);

        // Set the expiry duration for the signed URL (in seconds)
        const seconds = 60; // e.g., URL expires in 60 seconds

        // Generate the pre-signed URL
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: seconds });
        // console.log(signedUrl,"------------------ url")
        
        return signedUrl;
    } catch (error) {
        console.error('Error generating signed URL:', error);
        return null;
    }
};
