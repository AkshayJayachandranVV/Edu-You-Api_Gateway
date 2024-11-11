import express, {Request, Response} from 'express'
import tutorRabbitMqClient from './rabbitMQ/client'
import courseRabbitMqClient from '../course/rabbitMQ/client'
import userRabbitMqClient from '../user/rabbitMQ/client'
import orderRabbitMqClient from '../order/rabbitMQ/client'
import chatRabbitMqClient from '../chat/rabbitMQ/client'
import {jwtCreate} from '../../jwt/jwtCreate'
import { tutorClient } from './grpc/services/client';
import { getS3SignedUrl } from '../../s3SignedUrl/grtS3SignedUrl'
import { register } from 'module'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';



dotenv.config();


interface GrpcError extends Error {
    details?: string; // Adding details property
}

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

    register: async (req: Request, res: Response) => {
        try {
            console.log("Entered tutor registration", req.body);
    
            const data = req.body; // Get the registration data from the request body
    
            // Call the gRPC register method for the tutor
            tutorClient.register(data, (error: GrpcError | null, result: any) => {
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
                        tutorData: result.tutorData, // Include tutorData from the gRPC response
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
            console.error("Error during tutor registration:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later.",
                error: (error as Error).message, // Cast to Error to access message
            });
        }
    },
    

    verifyOtp: async (req: Request, res: Response) => {
        try {
            console.log("Entered tutor OTP verification with request body", req.body);
    
            const data = req.body; // Extract data from request body
    
            // Call the gRPC verifyOtp method for tutor
            tutorClient.verifyOtp(data, (error: GrpcError | null, result: any) => {
                if (error) {
                    console.error("gRPC error:", error);
                    return res.status(500).json({
                        success: false,
                        message: "Internal Server Error. Please try again later.",
                        error: error.details || error.message,
                    });
                }
    
                console.log(result, 'OTP verification result for tutor');
    
                // Check if the OTP verification was successful
                if (result && result.success) {
                    return res.json({
                        success: true,
                        message: "OTP verified. Tutor registered successfully",
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
                            message: "Tutor registration failed. Please try again.",
                        });
                    }
                }
            });
    
        } catch (error) {
            console.error("Error during tutor OTP verification:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later.",
                error: (error as Error).message, // Cast error to access its message
            });
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

//   login : async(req : Request, res : Response) =>{
//     try {
        
//         console.log("Entered to the login user",req.body)

//         const data = req.body

//         const operation = 'login_tutor'

//         const result: any = await tutorRabbitMqClient.produce(data,operation)

//         console.log(result, 'successfully logged in');

//         if(result.success == true){

//                 const payload = {id:result.tutorData._doc._id, email : result.tutorData._doc.email,role:"tutor"}

//               const {accessToken,refreshToken} = jwtCreate(payload)

//               console.log(accessToken,refreshToken,"got the tokensss")



//                 return res.json({
//                     success: true,
//                     message: 'Login successful',
//                     tutorData:result.tutorData._doc,
//                     tutorId: result.tutorData._doc._id,
//                     role: result.role,
//                     tutorAccessToken : accessToken,
//                     tutorRefreshToken : refreshToken
//                   });

//         }

//         return res.json(result)

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "Internal Server Error. Please try again later."
//         })

//     }
// },


login: async (req: Request, res: Response) => {
    try {
        console.log("Entered to the login tutor", req.body);

        const data = req.body; // Get the login data from the request body

        // Call the gRPC login method for tutors
        tutorClient.login(data, (error: GrpcError | null, result: any) => {
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
                    id: result.tutorData.id,  // Accessing the tutor ID from the result
                    email: result.tutorData.email,
                    role: result.role
                };

                console.log(payload, "here important tutor id and email");

                // Generate tokens
                const { accessToken, refreshToken } = jwtCreate(payload);
                console.log(accessToken, refreshToken, "got the tokens");

                // Return successful login response
                return res.json({
                    success: true,
                    message: 'Login successful',
                    tutorData: result.tutorData, // Include tutorData from the gRPC response
                    tutorId: result.tutorData.id, // Assuming tutorData contains id
                    role: result.role,
                    tutorAccessToken: accessToken,
                    tutorRefreshToken: refreshToken
                });
            } else {
                // Handle invalid email or password
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
            console.log("Entered googleLogin tutor", req.body);
    
            const data = req.body; // Get the login data from the request body
    
            // Call the gRPC googleLogin method for tutors
            tutorClient.googleLogin(data, (error: GrpcError | null, result: any) => {
                if (error) {
                    console.error("gRPC error:", error);
                    return res.status(500).json({
                        success: false,
                        message: "Internal Server Error. Please try again later.",
                        error: error.details || error.message, // Use error.details directly
                    });
                }
    
                console.log(result, 'successfully google logged in tutor');
    
                // Check if the login was successful
                if (result && result.success) {
                    // Create payload for JWT
                    const payload = { 
                        id: result.tutor_data._id, 
                        email: result.tutor_data.email,
                        role: "tutor" // Assuming role as "tutor"
                    };
    
                    console.log(payload, "here important id and email for tutor");
    
                    // Generate tokens
                    const { accessToken, refreshToken } = jwtCreate(payload);
                    console.log(accessToken, refreshToken, "got the tokens for tutor");
    
                    // Return successful login response
                    return res.json({
                        success: true,
                        message: 'Login successful',
                        tutorId: result.tutor_data._id, // Assuming tutor_data contains _id
                        tutor_data: result.tutor_data,  // Include tutor_data from the gRPC response
                        role: "tutor",
                        tutorAccessToken: accessToken, 
                        tutorRefreshToken: refreshToken 
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
            console.error("Error during googleLogin for tutor:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later.",
                error: (error as Error).message, // Cast to Error to access message
            });
        }
    },
    



    tutorGoogleLogin: async (req: Request, res: Response) => {
        try {
            console.log("Entered googleLogin for tutor", req.body);
    
            const data = req.body; // Get the login data from the request body
    
            // Call the gRPC googleLogin method for tutor
            tutorClient.googleLogin(data, (error: GrpcError | null, result: any) => {
                if (error) {
                    console.error("gRPC error during tutor google login:", error);
                    return res.status(500).json({
                        success: false,
                        message: "Internal Server Error. Please try again later.",
                        error: error.details || error.message, // Use error.details if available
                    });
                }
    
                console.log(result, 'successfully google logged in as tutor');
    
                // Check if the login was successful
                if (result && result.success) {
                    // Create payload for JWT
                    const payload = { 
                        id: result.tutor_data.id, 
                        email: result.tutor_data.email,
                        role: "tutor" // Assuming role as "tutor"
                    };
    
                    console.log(payload, "here important id and email");
    
                    // Generate tokens
                    const { accessToken, refreshToken } = jwtCreate(payload);
                    console.log(accessToken, refreshToken, "got the tokens");
    
                    // Return successful login response
                    return res.json({
                        success: true,
                        message: 'Login successful',
                        tutorId: result.tutor_data.id, // Assuming tutor_data contains _id
                        tutor_data: result.tutor_data,  // Include tutor_data from the gRPC response
                        role: "tutor",
                        tutorAccessToken: accessToken, 
                        tutorRefreshToken: refreshToken 
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
            console.error("Error during tutor google login:", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later.",
                error: (error as Error).message, // Cast to Error to access message
            });
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



    payouts: async (req: Request, res: Response) => {
        try {
            console.log("course payouts ------------------------------", req.params);
        
            const operation = 'order-tutor-payouts';
            const data = req.params;
            
            // Fetch the payout data from RabbitMQ
            const result: any = await orderRabbitMqClient.produce(data, operation);
    
            // Map over each order item in result and convert S3 key to signed URL for thumbnail
            if (result && result.orders) {
                const updatedOrders = await Promise.all(result.orders.map(async (order: any) => {
                    const signedThumbnailUrl = await getS3SignedUrl(order.thumbnail);
                    return {
                        ...order,
                        thumbnail: signedThumbnailUrl,  // Replace with signed URL
                    };
                }));
                
                // Attach updated orders back to result
                result.orders = updatedOrders;
            }
    
            return res.json(result);
        } catch (error) {
            console.log(error, "error in payouts");
            return res.status(500).json({ message: "Internal server error" });
        }
    },
    


    courseStudents: async (req: Request, res: Response) => {
        try {
            console.log("my courses tutor", req.params);
            const { courseId } = req.params;
            const operation = 'tutor-course-students';
    
            const data = {
                courseId: courseId
            };
    
            // First RabbitMQ call to fetch student list from the tutor service
            const result: any = await tutorRabbitMqClient.produce(data, operation);
            console.log("result from tutor service:------------------------", result);
    
            // Handle the case when no students are found
            if (!result || !result.students || result.students.length === 0) {
                return res.json({ success: false, message: "No students enrolled for this course." });
            }
    
            const operation2 = 'tutor-user-details';
            // Fetch additional user details for the found students
            const result2: any = await userRabbitMqClient.produce(result.students.students, operation2);
            console.log("result from user service:", result2);
    
            // Return the student data along with user details
            return res.json({ success: true, students: result2 });
        } catch (error) {
            console.log(error, "error in courseStudents function");
            return res.status(500).json({ success: false, message: "An error occurred while fetching students." });
        }
    },


    getPresignedUrl : async (req: Request, res: Response) => {
        try {
            const s3Key = req.query.s3Key as string;
            if (!s3Key) {
                return res.status(400).json({ error: 's3Key query parameter is required' });
            }
    
            const params = {
                Bucket: process.env.S3_BUCKET_NAME!,
                Key: s3Key,
            };
    
            const command = new GetObjectCommand(params);
            const url = await getSignedUrl(s3Client, command, { expiresIn:604800 });
    
            return res.json({ url });
        } catch (error) {
            console.error("Error generating pre-signed URL:", error);
            return res.status(500).json({ error: 'Failed to generate pre-signed URL' });
        }
    },
    
    

    cardsData: async (req: Request, res: Response) => {
        try {
            console.log("Fetching tutor data:", req.params);
            const data = req.params;
            console.log(data)
            const operationEarnings = 'tutor-total-earning';
            const operationCardsData = 'tutor-cards-data';
    
            // Call both RabbitMQ clients to retrieve data
            const resultEarnings: any = await orderRabbitMqClient.produce(data, operationEarnings);
            // console.log("first reply",resultEarnings)
            const resultCardsData: any = await tutorRabbitMqClient.produce(data, operationCardsData);
            // console.log("sedon reply",resultCardsData)
    
            // Combine the two results

            console.log(resultCardsData,resultEarnings)
            const combinedResult = {
                earningsData: resultEarnings,
                cardsData: resultCardsData,
            };
    
            return res.json(combinedResult);
        } catch (error) {
            console.log(error, "Error in cardsData");
            res.status(500).json({ error: "Failed to retrieve tutor data" });
        }
    },
    
   
    graphData: async (req: Request, res: Response) => {
        try {
            console.log("Fetching tutor data:", req.params);
            const data = req.params;
            console.log(data)
            const operation1 = 'tutor-bargraph-data';
            const operation2 = 'tutor-piegraph-data';
            const operation3 = 'tutor-fetch-graphCourses';
    
            // Call both RabbitMQ clients to retrieve data
            const resultBar: any = await orderRabbitMqClient.produce(data, operation1);
            console.log("first reply",resultBar)
            const resultPie: any = await tutorRabbitMqClient.produce(data,operation2);
            console.log("sedon reply",resultPie)
            const PieFetchCourse: any = await courseRabbitMqClient.produce(resultPie,operation3);
    
            // Combine the two results

            console.log("00000000000000000000000000",resultBar,PieFetchCourse,"--------------------------------------")
            const combinedResult = {
                barGraph: resultBar,
                pieGraph: PieFetchCourse,
            };
    
            return res.json(combinedResult);
        } catch (error) {
            console.log(error, "Error in cardsData");
            res.status(500).json({ error: "Failed to retrieve tutor data" });
        }
    },
   

    courseView: async (req: Request, res: Response) => {
        try {
          console.log("senf ile ------------------------------", req.params);
    
          const operation = "course-view-details";
    
          const data = req.params;
          // Fetch the chat data
          const result: any = await courseRabbitMqClient.produce(data, operation);
    
          return res.json(result);
        } catch (error) {
          console.log(error, "error in fetchChat");
          return res.status(500).json({ message: "Internal server error" });
        }
      },


      getUserCourses: async (req: Request, res: Response) => {
        try {
          console.log("my courses tutor", req.params);
          const { userId } = req.params;
          const operation1 = "user-my-course";
    
          const data = {
            userId: userId,
          };
          const result1: any = await userRabbitMqClient.produce(data, operation1);
          // console.log("resuylteeee----------------------------------------11111111111111111111111111111111111111111", result1);
    
          const operation2 = "fetch-course-myCourse";
          const result2: any = await courseRabbitMqClient.produce(
            result1,
            operation2
          );
          // console.log("resuylteeee-----------------------------------------2222222222222222222222222222222222222222", result2);
    
          const operation3 = 'fetch-last-message'
    
          const result3 = await chatRabbitMqClient.produce(result2.courses,operation3)
       
    
          console.log(result3)
    
          return res.json(result3);
        } catch (error) {
          console.log(error, "error in google login");
        }
      },


}


