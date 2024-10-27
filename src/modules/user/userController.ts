import express, {Request, Response} from 'express'
import userRabbitMqClient from './rabbitMQ/client'
import {jwtCreate} from '../../jwt/jwtCreate'
import courseRabbitMqClient from '../course/rabbitMQ/client'
import paymentRabbitMqClient from '../payment/rabbitMQ/client'
import orderRabbitMqClient from '../order/rabbitMQ/client'
import tutorRabbitMqClient from '../tutor/rabbitMQ/client'
import chatRabbitMqClient from '../chat/rabbitMQ/client'
import { userClient } from './grpc/services/client';
import { getS3SignedUrl } from '../../s3SignedUrl/grtS3SignedUrl';
import * as grpc from '@grpc/grpc-js';
import { register } from 'module'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


interface GrpcError extends Error {
    details?: string; // Adding details property
}





export const useController ={

    // memoryStorage: {} as { [key: string]: any },

    register: async (req: Request, res: Response) => {
        try {
            console.log("Entered user registration", req.body);
    
            const data = req.body; // Get the registration data from the request body
    
            // Call the gRPC register method
            userClient.register(data, (error: GrpcError | null, result: any) => {
                if (error) {
                    console.error("gRPC error:", error);
                    return res.status(500).json({
                        success: false,
                        message: "Internal Server Error. Please try again later.",
                        error: error.details || error.message, // Use error.details directly
                    });
                }
    
                console.log(result, 'registration result');
    
                // Check if the registration was successful
                if (result && result.success) {
                    // Return successful registration response
                    return res.json({
                        success: true,
                        message: result.message || 'Registration successful. Verify the OTP to complete registration.',
                        userData: result.userData, // Include userData from the gRPC response
                        tempId: result.tempId // Assuming tempId is returned for OTP verification
                    });
                } else {
                    // Handle registration failure
                    return res.json({
                        success: false,
                        message: result.message || 'Registration failed. Please try again.',
                    });
                }
            });
    
        } catch (error) {
            console.error("Error during registration:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later.",
                error: (error as Error).message, // Cast to Error to access message
            });
        }
    },
    

    verifyOtp: async (req: Request, res: Response) => {
        try {
            console.log("Entered verifyOtp with request body", req.body);
    
            const data = req.body; // Extract data from request body
    
            // Call the gRPC verifyOtp method
            userClient.verifyOtp(data, (error: GrpcError | null, result: any) => {
                if (error) {
                    console.error("gRPC error:", error);
                    return res.status(500).json({
                        success: false,
                        message: "Internal Server Error. Please try again later.",
                        error: error.details || error.message,
                    });
                }
    
                console.log(result, 'OTP verification result');
    
                // Check if the OTP verification was successful
                if (result && result.success) {
                    return res.json({
                        success: true,
                        message: "OTP verified. User registered successfully",
                    });
                } else {
                    // Handle cases for incorrect OTP or registration failure
                    if (result.message === 'Incorrect OTP') {
                        return res.json({
                            success: false,
                            message: "Incorrect Otp",
                        });
                    } else {
                        return res.status(500).json({
                            success: false,
                            message: "User registration failed. Please try again.",
                        });
                    }
                }
            });
    
        } catch (error) {
            console.error("Error during OTP verification:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later.",
                error: (error as Error).message, // Cast error to access its message
            });
        }
    },
    

    // login : async(req : Request, res : Response) =>{
    //     try {
            
    //         console.log("Entered to the login user",req.body)

    //         const data = req.body

    //         const operation = 'login_user'

    //         const result: any = await userRabbitMqClient.produce(data,operation)

    //         console.log(result, 'successfully logged in');

    //         if(result.success == true){

    //                 const payload = {id:result.userData._doc._id, email : result.userData._doc.email,role:"user"}

    //                 console.log(payload ,"here important id and email")

    //               const {accessToken,refreshToken} = jwtCreate(payload)

    //               console.log(accessToken,refreshToken ,"got the token")

  

    //               return res.json({
    //                 success: true,
    //                 message: 'Login successful',
    //                 userData:result.userData._doc,
    //                 userId: result.userId,
    //                 role: result.role,
    //                 userAccessToken: accessToken, 
    //                 userRefreshToken: refreshToken 
    //             });
                

    //         }

    //         return res.json(result)

    //     } catch (error) {
    //         return res.status(500).json({
    //             success: false,
    //             message: "Internal Server Error. Please try again later."
    //         })

    //     }
    // },


    // login: async (req: Request, res: Response) => {
    //     try {
    //         console.log("Entered login user", req.body);
    //         const data = req.body;
    
    //         const requestPayload = {
    //             email: data.email,
    //             password: data.password,
    //         };
    
    //         console.log("Request Payload:", requestPayload);
    
    //         client.UserLogin(requestPayload, (error: GrpcError | null, result: any) => {
    //             if (error) {
    //                 console.error("gRPC error:", error);
    //                 return res.status(500).json({
    //                     success: false,
    //                     message: "Internal Server Error. Please try again later.",
    //                     error: error.details || error.message, // Use error.details directly
    //                 });
    //             }
    
    //             if (result && result.success) {
    //                 console.log(result, 'successfully logged in');
    
    //                 const payload = { id: result.userId, email: data.email, role: "user" };
    //                 const { accessToken, refreshToken } = jwtCreate(payload);
    
    //                 return res.json({
    //                     success: true,
    //                     message: 'Login successful',
    //                     userId: result.userId,
    //                     role: "user",
    //                     userAccessToken: accessToken,
    //                     userRefreshToken: refreshToken
    //                 });
    //             } else {
    //                 console.log("Login failed. Result:", result);
    //                 return res.status(401).json({
    //                     success: false,
    //                     message: 'Invalid email or password'
    //                 });
    //             }
    //         });
    //     } catch (error) {
    //         console.error("Error during login:", error);
    //         return res.status(500).json({
    //             success: false,
    //             message: "Internal Server Error. Please try again later.",
    //             error: (error as Error).message, // Cast to Error to access message
    //         });
    //     }
    // },

    login: async (req: Request, res: Response) => {
        try {
            console.log("Entered login user", req.body);
    
            const data = req.body; // Get the login data from the request body
    
            // Call the gRPC login method
            userClient.login(data, (error: GrpcError | null, result: any) => {
                if (error) {
                    console.error("gRPC error:", error);
                    return res.status(500).json({
                        success: false,
                        message: "Internal Server Error. Please try again later.",
                        error: error.details || error.message, // Use error.details directly
                    });
                }
    
                console.log(result, 'successfully logged in');
    
                // Check if the login was successful
                if (result && result.success) {
                    // Create payload for JWT
                    const payload = { 
                        id: result.userData.id, 
                        email: result.userData.email,
                        role: result.role 
                    };
    
                    console.log(payload, "here important id and email");
    
                    // Generate tokens
                    const { accessToken, refreshToken } = jwtCreate(payload);
                    console.log(accessToken, refreshToken, "got the tokens");
    
                    // Return successful login response
                    return res.json({
                        success: true,
                        message: 'Login successful',
                        userData: result.userData, // Include userData from the gRPC response
                        userId: result.userData.id, // Assuming userData contains id
                        role: result.role,
                        userAccessToken: accessToken, 
                        userRefreshToken: refreshToken 
                    });
                } else {
                    // Handle specific invalid password response
                    return res.json({
                        success: false,
                        message: result.message || 'Invalid email or password',
                    });
                }
            });
    
        } catch (error) {
            console.error("Error during login:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later.",
                error: (error as Error).message, // Cast to Error to access message
            });
        }
    },


    googleLogin: async (req: Request, res: Response) => {
        try {
            console.log("Entered googleLogin user", req.body);
    
            const data = req.body; // Get the login data from the request body
    
            // Call the gRPC googleLogin method
            userClient.googleLogin(data, (error: GrpcError | null, result: any) => {
                if (error) {
                    console.error("gRPC error:", error);
                    return res.status(500).json({
                        success: false,
                        message: "Internal Server Error. Please try again later.",
                        error: error.details || error.message, // Use error.details directly
                    });
                }
    
                console.log(result, 'successfully google logged in');
    
                // Check if the login was successful
                if (result && result.success) {
                    // Create payload for JWT
                    const payload = { 
                        id: result.user_data.id, 
                        email: result.user_data.email,
                        role: "user" // Assuming role as "user"
                    };
    
                    console.log(payload, "here important id and email");
    
                    // Generate tokens
                    const { accessToken, refreshToken } = jwtCreate(payload);
                    console.log(accessToken, refreshToken, "got the tokens");
    
                    // Return successful login response
                    return res.json({
                        success: true,
                        message: 'Login successful',
                        userId: result.user_data.id, // Assuming user_data contains _id
                        user_data: result.user_data,  // Include user_data from the gRPC response
                        role: "user",
                        userAccessToken: accessToken, 
                        userRefreshToken: refreshToken 
                    });
                } else {
                    // Handle failure response from gRPC
                    return res.json({
                        success: false,
                        message: result.message || 'Google login failed',
                    });
                }
            });
        } catch (error) {
            console.error("Error during googleLogin:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later.",
                error: (error as Error).message, // Cast to Error to access message
            });
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
    },


    courseDetails : async(req : Request, res : Response) => {
        try {

            console.log("Entered to the courseDetails user")

            const { courseId } = req.params; 

            const data = {
                courseId:courseId
            }
    
            const operation = 'course-details'

            const result: any = await courseRabbitMqClient.produce(data,operation)

            console.log(result, 'course-------details ----------user ');

            return res.json(result)
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
        }
    },


    allCourses : async(req : Request, res : Response) => {
        try {

            console.log("Entered to the all courses user")
            const data = ""
    
            const operation = 'all-courses'

            const result: any = await courseRabbitMqClient.produce(data,operation)

            console.log(result, 'course-------details ----------user ');

            return res.json(result)
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
        }
    },


    payment : async(req : Request, res : Response) => {
        try {

            console.log("Entered to the payment mode")
            const data = req.body
    
            const operation = 'course-payment'

            const result: any = await paymentRabbitMqClient.produce(data,operation)

            console.log(result, 'course-------details ----------user ');

            return res.json(result)
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
        }
    },


    orderSuccess : async(req : Request, res : Response) => {
        try {

            console.log("Entered to the payment mode")
            const data = req.body
    
            // const operation = 'order-save'

            console.log(data)

            const result: any = await orderRabbitMqClient.produce(data,'order-save')
            let {tutorId,userId,courseId} = result.dataId
            console.log(result, 'result 1---------1----1---------1 ');
            const userSend={userId,courseId}
            const result2: any = await userRabbitMqClient.produce(userSend,'update-my-course')
            console.log(result2,"----------2-------------2-------------2")
            const tutorSend = {tutorId,courseId,userId}
            const result3: any = await tutorRabbitMqClient.produce(tutorSend,'update-course-students')
            console.log(result3,"----------3-------------3-------------3")
            const result4: any = await courseRabbitMqClient.produce(userSend,'update-course-students')
            console.log(result4,"----------4-------------4-------------4")
            const result5: any = await chatRabbitMqClient.produce({tutorId,userId,courseId},'create-chat-room')
            console.log(result5,"----------5-------------5-------------5")

            return res.json(result)
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
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


    getUserCourses: async (req: Request, res: Response) => {
        try {
            console.log("my courses tutor", req.params);
            const { userId } = req.params;
            const operation1 = 'user-my-course';
            
            const data = {
                userId:userId
            }
            const result1: any = await userRabbitMqClient.produce(data,operation1);
            // console.log("resuylteeee----------------------------------------11111111111111111111111111111111111111111", result1);

            const operation2 = 'fetch-course-myCourse'
            const result2: any = await courseRabbitMqClient.produce(result1,operation2);
            // console.log("resuylteeee-----------------------------------------2222222222222222222222222222222222222222", result2);
            return res.json(result2);
        } catch (error) {
            console.log(error, "error in google login");
        }
    },


    fetchChat: async (req: Request, res: Response) => {
        const isS3Key = (key: string) => {
            return key.startsWith("uploads/"); // Adjust this based on your S3 key format
        };
    
        try {
            const { roomId, userId } = req.query;
    
            if (!roomId || !userId) {
                return res.status(400).json({ message: "Missing required parameters: roomId or userId" });
            }
    
            const operation = 'user-fetch-chat';
            
            const data = {
                userId: userId,
                roomId: roomId
            };
    
            // Fetch the chat data
            const result: any = await chatRabbitMqClient.produce(data, operation);
            const result2: any = await userRabbitMqClient.produce(result, 'chat-user-data');
    
            // Loop through the chat messages and update profile_picture, image, and video with signed URLs if needed
            const updatedMessages = await Promise.all(
                result2.map(async (message: any) => {
                    // Generate signed URL for the profile picture
                    if (message.profile_picture) {
                        const signedUrl = await getS3SignedUrl(message.profile_picture);
                        message.profile_picture = signedUrl; // Replace with signed URL
                    }
    
                    // If image is an S3 key, replace with the signed URL
                    if (message.image && isS3Key(message.image)) {
                        const signedImageUrl = await getS3SignedUrl(message.image);
                        message.image = signedImageUrl; // Replace image with signed URL
                    }
    
                    // If video is an S3 key, replace with the signed URL
                    if (message.video && isS3Key(message.video)) {
                        const signedVideoUrl = await getS3SignedUrl(message.video);
                        message.video = signedVideoUrl; // Replace video with signed URL
                    }
    
                    return message;
                })
            );
    
            return res.json(updatedMessages);
        } catch (error) {
            console.error("Error in fetchChat:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    },
    
    
    



    sendFile: async (req: Request, res: Response) => {
        try {
            console.log("senf ile ------------------------------",req.body);
    
            const operation = 'chat-store-file';
            
            const data = req.body
            // Fetch the chat data
            const result: any = await chatRabbitMqClient.produce(data, operation);
    

            return res.json(result);
        } catch (error) {
            console.log(error, "error in fetchChat");
            return res.status(500).json({ message: "Internal server error" });
        }
    },






}








