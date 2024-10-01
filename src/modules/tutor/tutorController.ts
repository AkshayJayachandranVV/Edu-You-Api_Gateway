import express, {Request, Response} from 'express'
import tutorRabbitMqClient from './rabbitMQ/client'
import {jwtCreate} from '../../jwt/jwtCreate'
import { register } from 'module'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';


dotenv.config();


import { S3Client, GetObjectCommand,PutObjectCommand} from '@aws-sdk/client-s3'

import {getSignedUrl} from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
});



export const tutorController ={

    register: async (req:Request, res:Response) => {
        try{

            console.log("entered --------------------- to the tutor aoi")

            const data = req.body;
            const operation ='register_tutor'

            console.log(req.body, 'body data')

            const result: any = await tutorRabbitMqClient.produce(data, operation);
            console.log(result, 'register-tutor');
               
            return res.json(result)
            // res.status(200).json({success: true, message: 'sample test'})       

        }catch(error){
            console.log("problem with the register in api gatewwayy")
        }
    },

    otp : async (req:Request, res:Response) =>{
        try {
            console.log("entered --------------------- to the tutor otp ")
            const data = req.body;
            const operation ='tutor-verify_otp'

            const result: any = await tutorRabbitMqClient.produce(data, operation);

            console.log(result, 'verified otp');

            if(result && result.success){

                return res.json({
                    success: true,
                    message:  "OTP verified. Tutor registered successfully",
                });

            }else{

                console.log("eneterd into the ELSE CASE OGTHE API GATEWAY ",result.message)

                if(result.message == "Incorrect Otp"){
                    return res.json({
                        success: false,
                        message:  "Incorrect Otp",
                    });
                }else{
                    return res.status(500).json({
                        success: false,
                        message: "User registration failed. Please try again."
                    });
                }

            }

        } catch (error) {
            console.log("problem with the register in api gatewwayy")
        }
    },

    resendOtp : async(req : Request , res : Response) =>{
        try {

          console.log("Entered to resend otp ----------------",req.body)

          const data = req.body

          const operation = 'tutor-resend_otp'

          const result: any = await tutorRabbitMqClient.produce(data,operation)

          console.log(result, 'Result got in resend otp');

          return res.json(result)
          
        } catch (error) {
          
        }
  },

  login : async(req : Request, res : Response) =>{
    try {
        
        console.log("Entered to the login user",req.body)

        const data = req.body

        const operation = 'login_tutor'

        const result: any = await tutorRabbitMqClient.produce(data,operation)

        console.log(result, 'successfully logged in');

        if(result.success == true){

                const payload = {id:result.tutorData._id, email : result.tutorData.email,role:"tutor"}

              const {accessToken,refreshToken} = jwtCreate(payload)

              console.log(accessToken,refreshToken,"got the tokensss")



                return res.json({
                    success: true,
                    message: 'Login successful',
                    userId: result.userId,
                    role: result.role,
                    tutorAccessToken : accessToken,
                    tutorRefreshToken : refreshToken
                  });

        }

        return res.json(result)

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error. Please try again later."
        })

    }
},

    forgotPassword : async(req : Request, res : Response) => {
        try {

            console.log("Entered to the forgotPassprd tutor",req.body)

            const data = req.body
    
            const operation = 'forgotPassword_tutor'

            const result: any = await tutorRabbitMqClient.produce(data,operation)

            console.log(result, 'Fogot-------Passord --------tutor');

            return res.json(result)
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
        }
    },


    forgotOtpVerify : async(req : Request, res : Response) => {
        try {

            console.log("Entered to the forgotPassprd user",req.body)

            const data = req.body
    
            const operation = 'tutor-forgot-otp-verify'

            const result: any = await tutorRabbitMqClient.produce(data,operation)

            console.log(result, 'tutor----Fogot-------verify ----------pasword ');

            return res.json(result)
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
        }
    },


    resetPassword : async(req : Request, res : Response) => {
        try {

            console.log("Entered to the forgotPassprd user",req.body)

            const data = req.body
    
            const operation = 'tutor-reset-password'

            const result: any = await tutorRabbitMqClient.produce(data,operation)

            console.log(result, 'reset-------password ----------pasword ');

            return res.json(result)
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
        }
    },

    googleLogin: async (req: Request, res: Response) => {
        try {
            console.log("dddddddddddddddddddddd", req.body);

            const { credential } = req.body;
            const operation = "google_login";
            const result: any = await tutorRabbitMqClient.produce(
                { credential },
                operation
            );
            console.log("resuylteeee", result);
            if (result.success) {
                const { accessToken, refreshToken } = jwtCreate({
                    id: result.user._id,
                    email: result.user.email,
                    role:"tutor"
                });

              
            }

            return res.json(result);
        } catch (error) {
            console.log(error, "error in google login");
        }
    },



    tutorGoogleLogin : async(req : Request, res : Response) =>{
        try {
            
            console.log("Entered to the goooogle login TUTOR",req.body)

            const data = req.body;

            const operation = 'google-login_tutor'

            const result: any = await tutorRabbitMqClient.produce(data,operation)

            console.log(result, 'successfully google logged in');

            if(result.success == true){

                    const payload = {id:result.tutor_data._id, email : result.tutor_data.email,role:"tutor"}

                  const {accessToken,refreshToken} = jwtCreate(payload)

                  console.log(accessToken,refreshToken ,"got the token")

  

                  return res.json({
                    success: true,
                    message: 'Login successful',
                    tutorId: result.tutor_data._id,
                    role: "user",
                    tutorAccessToken: accessToken, 
                    tutoeRefreshToken: refreshToken 
                });
                

            }

            return res.json(result)

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })

        }
    },

   
    getPresignedUrlForUpload : async (req: Request, res: Response) => {
        try {
            const { filename, fileType } = req.query as { filename: string; fileType: string; };
    
            console.log('S3_BUCKET_NAME:', process.env.S3_BUCKET_NAME);
    
            // Validate filename and fileType query parameters
            if (typeof filename !== 'string' || typeof fileType !== 'string') {
                return res.status(400).json({ error: 'Filename and fileType query parameters are required and should be strings.' });
            }
    
            // Map fileType to content type
            let contentType = 'application/octet-stream';  // Default content type
            if (fileType === 'image') {
                contentType = 'image/jpeg';
            } else if (fileType === 'video') {
                contentType = 'video/mp4'; // Adjust if necessary for different video types
            }
    
            // Generate a unique file key in S3 using the provided filename
            const fileKey = `uploads/${Date.now()}_${filename}`;
    
            // Create a command to put object in S3
            const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME!,
                Key: fileKey,
                ContentType: contentType, // Set the content type for the uploaded file
            });
    
            // Generate a presigned URL valid for 1 hour
            const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
            console.log('Presigned URL generated:', url);
    
            // Return the presigned URL and the file key for further use
            return res.json({ url, key: fileKey });
        } catch (error) {
            console.error('Error generating presigned URL:', error);
            return res.status(500).json({ error: 'Could not generate presigned URL' });
        }
    },

    

}