import express, {Request, Response} from 'express'
import tutorRabbitMqClient from './rabbitMQ/client'
import courseRabbitMqClient from '../course/rabbitMQ/client'
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

                const payload = {id:result.tutorData._doc._id, email : result.tutorData._doc.email,role:"tutor"}

              const {accessToken,refreshToken} = jwtCreate(payload)

              console.log(accessToken,refreshToken,"got the tokensss")



                return res.json({
                    success: true,
                    message: 'Login successful',
                    tutorData:result.tutorData._doc,
                    tutorId: result.tutorData._doc._id,
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

                    const payload = {id:result.tutorData._doc._id, email : result.tutorData._doc.email,role:"tutor"}

                  const {accessToken,refreshToken} = jwtCreate(payload)

                  console.log(accessToken,refreshToken ,"got the token")

  

                  return res.json({
                    success: true,
                    message: 'Login successful',
                    tutorId: result.tutorData._doc._id,
                    tutorData:result.tutorData._doc,
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

   

    
    getPresignedUrlForUpload: async (req: Request, res: Response) => {
        try {
          const { filename, fileType } = req.query;
      
          if (!filename || !fileType) {
            return res.status(400).json({ error: 'Filename and fileType are required.' });
          }
      
          const contentType = fileType === 'video' ? 'video/mp4' : 'application/octet-stream';
          const fileKey = `uploads/${Date.now()}_${filename}`; // This generates a unique key for each upload
      
          // Create a command for uploading the file
          const command = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileKey,
            ContentType: contentType,
          });
     
          // Generate a presigned URL for the upload
          const uploadUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600, // URL expires in 1 hour
          });
      
          // Generate a presigned URL for viewing the video
          const viewCommand = new GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileKey,
          });
      
          const viewUrl = await getSignedUrl(s3Client, viewCommand, {
            expiresIn: 3600, // URL expires in 1 hour
          });
      
          console.log('Presigned URL for upload:', uploadUrl);
          console.log('Presigned URL for viewing:', viewUrl);
          console.log('file key gggggg', fileKey);
          
          // Send both the presigned URL for uploading, viewing URL, and the S3 key back to the front end
          return res.json({ uploadUrl, viewUrl, key: fileKey });
        } catch (error) {
          console.error('Error generating presigned URLs:', error);
          return res.status(500).json({ error: 'Failed to generate presigned URLs' });
        }
      },



      myCourses: async (req: Request, res: Response) => {
        try {
            console.log("my courses tutor", req.params);
            const { tutorId } = req.params;
            const operation = "tutor-courses";

            const data = {
                tutorId:tutorId
            }

            const result: any = await courseRabbitMqClient.produce(data,operation);
            console.log("resuylteeee", result);
            

            return res.json(result);
        } catch (error) {
            console.log(error, "error in google login");
        }
    },


    listCourse: async (req: Request, res: Response) => {
        try {
            console.log("my courses tutor", req.params);
            const { courseId } = req.params;
            const operation = "tutor-courses-list";

            const data = {
                courseId:courseId
            }

            const result: any = await courseRabbitMqClient.produce(data,operation);
            console.log("resuylteeee", result);
            

            return res.json(result);
        } catch (error) {
            console.log(error, "error in google login");
        }
    },



    fetchEditCourse: async (req: Request, res: Response) => {
        try {
            console.log("my courses tutor", req.params);
            const { courseId } = req.params;
            const operation = "tutor-edit-course";

            const data = {
                courseId:courseId
            }

            const result: any = await courseRabbitMqClient.produce(data,operation);
            console.log("resuylteeee", result);
            

            return res.json(result);
        } catch (error) {
            console.log(error, "error in google login");
        }
    },


    editProfile: async (req: Request, res: Response) => {
        try {
            console.log("Entered to the edit user",req.body)
            console.log(req.file, '=============userController for edit profile image');
            const image = req.file as Express.Multer.File | undefined;
            const data = req.body

            const validImageMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

            if (image) {
                // Check if the uploaded file has a valid MIME type
                if (!validImageMimeTypes.includes(image.mimetype)) {
                    return res.status(400).json({ error: "Only image files are allowed" });
                }
            }


            console.log(image, '-----------image in API gateway');
    
            const operation = 'tutor-edit_profile'

            const result: any = await tutorRabbitMqClient.produce({ image, data},operation)

            console.log(result, 'edit ------------ profile ');

            return res.json(result)
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
        }
    },



    getSignedUrl: async (req: Request, res: Response) => {
        try {
            console.log("my signed url -------------------------", );
            const { imageKey } = req.body;

            const params = {
                Bucket: process.env.S3_BUCKET_NAME!, // Ensure this env variable is set correctly
                Key: imageKey
              };
            
              // Generate the pre-signed URL with expiry time
              const command = new GetObjectCommand(params);
              const seconds = 10 ; // Set the expiry duration
              const url = await getSignedUrl(s3Client, command, { expiresIn: seconds });
            
            //   return url;
            
            return res.json(url);
        } catch (error) {
            console.log(error, "error in google login");
        }
    },


    

    getTutorDetails: async (req: Request, res: Response) => {
        try {
            console.log("my courses tutor", req.params);
            const { tutorId } = req.params;
            const operation = 'tutor-details';

            const data = {
                tutorId:tutorId
            }

            const result: any = await tutorRabbitMqClient.produce(data,operation);
            console.log("resuylteeee", result);
            

            return res.json(result);
        } catch (error) {
            console.log(error, "error in google login");
        }
    },




}


