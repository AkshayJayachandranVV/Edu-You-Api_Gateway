import express, {Request, Response} from 'express'
import userRabbitMqClient from './rabbitMQ/client'
import {jwtCreate} from '../../jwt/jwtCreate'
import { register } from 'module'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();




export const useController ={

    // memoryStorage: {} as { [key: string]: any },

    register: async (req:Request, res:Response) => {
        try{

            console.log("entered ---------------------")

            const data = req.body;
            const operation ='register_user'

            console.log(req.body, 'body data')

            const result: any = await userRabbitMqClient.produce(data, operation);
            console.log(result, 'register-user');
               
            return res.json(result)
            // res.status(200).json({success: true, message: 'sample test'})       

        }catch(error){

        }
    },

    verifyOtp: async(req: Request, res:Response) => {
        try{

            console.log("Entered to the verify otp",req.body)

            const data = req.body;
            const operation ='verify_otp'

            const result: any = await userRabbitMqClient.produce(data, operation);

            console.log(result, 'verified otp');

            if(result && result.success){

                return res.json({
                    success: true,
                    message:  "OTP verified. User registered successfully",
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

        }catch(error){
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
        }
    },

    login : async(req : Request, res : Response) =>{
        try {
            
            console.log("Entered to the login user",req.body)

            const data = req.body

            const operation = 'login_user'

            const result: any = await userRabbitMqClient.produce(data,operation)

            console.log(result, 'successfully logged in');

            if(result.success == true){

                    const payload = {id:result.userData._doc._id, email : result.userData._doc.email,role:"user"}

                    console.log(payload ,"here important id and email")

                  const {accessToken,refreshToken} = jwtCreate(payload)

                  console.log(accessToken,refreshToken ,"got the token")

  

                  return res.json({
                    success: true,
                    message: 'Login successful',
                    userData:result.userData._doc,
                    userId: result.userId,
                    role: result.role,
                    userAccessToken: accessToken, 
                    userRefreshToken: refreshToken 
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

    resendOtp : async(req : Request , res : Response) =>{
          try {

            console.log("Entered to the login user",req.body)

            const data = req.body

            const operation = 'resend_otp'

            const result: any = await userRabbitMqClient.produce(data,operation)

            console.log(result, 'Result got in resend otp');

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

            console.log("Entered to the forgotPassprd user",req.body)

            const data = req.body
    
            const operation = 'forgot-password'

            const result: any = await userRabbitMqClient.produce(data,operation)

            console.log(result, 'Fogot-------Passord ');

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
    
            const operation = 'forgot-otp-verify'

            const result: any = await userRabbitMqClient.produce(data,operation)

            console.log(result, 'Fogot-------verify ----------pasword ');

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
    
            const operation = 'reset-password'

            const result: any = await userRabbitMqClient.produce(data,operation)

            console.log(result, 'reset-------password ----------pasword ');

            return res.json(result)
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
        }
    },


    googleLogin : async(req : Request, res : Response) =>{
        try {
            
            console.log("Entered to the goooogle login user",req.body)

            const data = req.body;

            const operation = 'google-login_user'

            const result: any = await userRabbitMqClient.produce(data,operation)

            console.log(result, 'successfully google logged in');

            if(result.success == true){

                    const payload = {id:result.user_data._id, email : result.user_data.email,role:"user"}

                  const {accessToken,refreshToken} = jwtCreate(payload)

                  console.log(accessToken,refreshToken ,"got the token")

  

                  return res.json({
                    success: true,
                    message: 'Login successful',
                    userId: result.user_data._id,
                    user_data:result.user_data,
                    role: "user",
                    userAccessToken: accessToken, 
                    userRefreshToken: refreshToken 
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


    profile : async(req : Request, res : Response) => {
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
    
            const operation = 'edit_profile'

            const result: any = await userRabbitMqClient.produce({ image, data},operation)

            console.log(result, 'edit ------------ profile ');

            return res.json(result)
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
        }
    }


    

}






