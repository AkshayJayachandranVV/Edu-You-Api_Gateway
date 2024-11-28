import express, { Request, Response } from "express";
import userRabbitMqClient from "./rabbitMQ/client";
import { jwtCreate } from "../../jwt/jwtCreate";
import courseRabbitMqClient from "../course/rabbitMQ/client";
import paymentRabbitMqClient from "../payment/rabbitMQ/client";
import orderRabbitMqClient from "../order/rabbitMQ/client";
import tutorRabbitMqClient from "../tutor/rabbitMQ/client";
import chatRabbitMqClient from "../chat/rabbitMQ/client";
import { userClient } from "./grpc/services/client";
import { courseClient } from "../course/grpc/service/client";
import { tutorClient} from "../tutor/grpc/services/client";
import { getS3SignedUrl } from "../../s3SignedUrl/grtS3SignedUrl";
import * as grpc from "@grpc/grpc-js";
import { register } from "module";
import jwt from 'jsonwebtoken';
import config from "../../config/config";
import dotenv from "dotenv";


dotenv.config();

interface GrpcError extends Error {
  details?: string; // Adding details property
}

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}


interface UserJwtPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
}


const JWT_SECRET = config.jwt_key;
const JWT_REFRESH_SECRET =  config.jwt_refresh_key;


export const useController = {
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

        console.log(result, "registration result");

        // Check if the registration was successful
        if (result && result.success) {
          // Return successful registration response
          return res.json({
            success: true,
            message:
              result.message ||
              "Registration successful. Verify the OTP to complete registration.",
            userData: result.userData, // Include userData from the gRPC response
            tempId: result.tempId, // Assuming tempId is returned for OTP verification
          });
        } else {
          // Handle registration failure
          return res.json({
            success: false,
            message: result.message || "Registration failed. Please try again.",
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

        console.log(result, "OTP verification result");

        // Check if the OTP verification was successful
        if (result && result.success) {
          return res.json({
            success: true,
            message: "OTP verified. User registered successfully",
          });
        } else {
          // Handle cases for incorrect OTP or registration failure
          if (result.message === "Incorrect OTP") {
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

        console.log(result, "successfully logged in");

        // Check if the login was successful
        if (result && result.success) {
          // Create payload for JWT
          const payload = {
            id: result.userData.id,
            email: result.userData.email,
            role: result.role,
          };

          console.log(payload, "here important id and email");

          // Generate tokens
          const { accessToken, refreshToken } = jwtCreate(payload);
          console.log(accessToken, refreshToken, "got the tokens");

          // Return successful login response
          return res.json({
            success: true,
            message: "Login successful",
            userData: result.userData, // Include userData from the gRPC response
            userId: result.userData.id, // Assuming userData contains id
            role: result.role,
            userAccessToken: accessToken,
            userRefreshToken: refreshToken,
          });
        } else {
          // Handle specific invalid password response
          return res.json({
            success: false,
            message: result.message || "Invalid email or password",
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

        console.log(result, "successfully google logged in");

        // Check if the login was successful
        if (result && result.success) {
          // Create payload for JWT
          const payload = {
            id: result.user_data.id,
            email: result.user_data.email,
            role: "user", // Assuming role as "user"
          };

          console.log(payload, "here important id and email");

          // Generate tokens
          const { accessToken, refreshToken } = jwtCreate(payload);
          console.log(accessToken, refreshToken, "got the tokens");

          // Return successful login response
          return res.json({
            success: true,
            message: "Login successful",
            userId: result.user_data.id, // Assuming user_data contains _id
            user_data: result.user_data, // Include user_data from the gRPC response
            role: "user",
            userAccessToken: accessToken,
            userRefreshToken: refreshToken,
          });
        } else {
          // Handle failure response from gRPC
          return res.json({
            success: false,
            message: result.message || "Google login failed",
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

  resendOtp: async (req: Request, res: Response) => {
    try {
      console.log("Entered to the login user", req.body);

      const data = req.body;

      const operation = "resend_otp";

      const result: any = await userRabbitMqClient.produce(data, operation);

      console.log(result, "Result got in resend otp");

      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error. Please try again later.",
      });
    }
  },

  forgotPassword: async (req: Request, res: Response) => {
    try {
      console.log("Entered to the forgotPassprd user", req.body);

      const data = req.body;

      const operation = "forgot-password";

      const result: any = await userRabbitMqClient.produce(data, operation);

      console.log(result, "Fogot-------Passord ");

      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error. Please try again later.",
      });
    }
  },

  forgotOtpVerify: async (req: Request, res: Response) => {
    try {
      console.log("Entered to the forgotPassprd user", req.body);

      const data = req.body;

      const operation = "forgot-otp-verify";

      const result: any = await userRabbitMqClient.produce(data, operation);

      console.log(result, "Fogot-------verify ----------pasword ");

      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error. Please try again later.",
      });
    }
  },

  resetPassword: async (req: Request, res: Response) => {
    try {
      console.log("Entered to the forgotPassprd user", req.body);

      const data = req.body;

      const operation = "reset-password";

      const result: any = await userRabbitMqClient.produce(data, operation);

      console.log(result, "reset-------password ----------pasword ");

      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error. Please try again later.",
      });
    }
  },

  profile: async (req: Request, res: Response) => {
    try {
      console.log("Entered to the edit user", req.body);
      console.log(
        req.file,
        "=============userController for edit profile image"
      );
      const image = req.file as Express.Multer.File | undefined;
      const data = req.body;

      const validImageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

      if (image) {
        // Check if the uploaded file has a valid MIME type
        if (!validImageMimeTypes.includes(image.mimetype)) {
          return res
            .status(400)
            .json({ error: "Only image files are allowed" });
        }
      }

      console.log(image, "-----------image in API gateway");

      const operation = "edit_profile";

      const result: any = await userRabbitMqClient.produce(
        { image, data },
        operation
      );

      // console.log(result, "edit ------------ profile ");

      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error. Please try again later.",
      });
    }
  },

    courseDetails: async (req: Request, res: Response) => {
      try {
        console.log("Entered ---------- user0",req.params);
  
        const { courseId } = req.params;
  
        // Create the request payload
        const requestPayload = { courseId };
  
        // Call the gRPC method
        courseClient.courseDetails(requestPayload, (err: any, response: any) => {
          if (err) {
            console.error("gRPC error:", err);
            return res.status(500).json({
              success: false,
              message: "Failed to fetch course details.",
            });
          }

          console.log("kitty poyi",response)
  
          // Handle successful gRPC response
          return res.json(response);
        });
      } catch (error) {
        console.error("Internal Server Error:", error);
        return res.status(500).json({
          success: false,
          message: "Internal Server Error. Please try again later.",
        });
      }
    },
  



   allCourses : async (req: Request, res: Response) => {
    try {
      // Log entry for debugging
      console.log("Entered allCourses function--");
  
      // Prepare the gRPC request data if required
      const requestPayload = req.query; // Use an empty object for no input
  
      // Call the gRPC method
      courseClient.allCourses(requestPayload, (err: any, result: any) => {
        if (err) {
          console.error("gRPC Error:", err);
  
          // Return error response to the client
          return res.status(500).json({
            success: false,
            message: err.message || "Internal Server Error. Please try again later.",
          });
        }
  
        return res.json(result);
      });
    } catch (error) {
      console.error("Unexpected Error:", error);
  
      // Handle unexpected errors
      return res.status(500).json({
        success: false,
        message: "Internal Server Error. Please try again later.",
      });
    }
  },



  payment: async (req: Request, res: Response) => {
    try {
      console.log("Entered to the payment mode");
      const data = req.body;

      const operation = "course-payment";

      const result: any = await paymentRabbitMqClient.produce(data, operation);

      console.log(result, "course-------details ----------user ");

      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error. Please try again later.",
      });
    }
  },

  orderSuccess: async (req: Request, res: Response) => {
    try {
      console.log("Entered to the payment mode");
      const data = req.body;

      // const operation = 'order-save'

      console.log(data);

      const result: any = await orderRabbitMqClient.produce(data, "order-save");
      let { tutorId, userId, courseId } = result.dataId;
      console.log(result, "result 1---------1----1---------1 ");
      const userSend = { userId, courseId };
      const result2: any = await userRabbitMqClient.produce(
        userSend,
        "update-my-course"
      );
      // console.log(result2, "----------2-------------2-------------2");
      const tutorSend = { tutorId, courseId, userId };
      const result3: any = await tutorRabbitMqClient.produce(
        tutorSend,
        "update-course-students"
      );
      // console.log(result3, "----------3-------------3-------------3");
      const result4: any = await courseRabbitMqClient.produce(
        userSend,
        "update-course-students"
      );
      // console.log(result4, "----------4-------------4-------------4");
      const result5: any = await chatRabbitMqClient.produce(
        { tutorId, userId, courseId },
        "create-chat-room"
      );
      // console.log(result5, "----------5-------------5-------------5");

      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error. Please try again later.",
      });
    }
  },

  getTutorDetails: async (req: Request, res: Response) => {
    try {
      console.log("my courses tutor", req.params);
      const { tutorId } = req.params;
      const operation = "tutor-details";

      const data = {
        tutorId: tutorId,
      };

      const result: any = await tutorRabbitMqClient.produce(data, operation);
      // console.log("resuylteeee", result);

      return res.json(result);
    } catch (error) {
      console.log(error, "error in google login");
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
   

      // console.log(result3)

      return res.json(result3);
    } catch (error) {
      console.log(error, "error in google login");
    }
  },

  

  fetchChat: async (req: Request, res: Response) => {
    const isS3Key = (key: string) => {
      return key.startsWith("uploads/"); // Adjust this based on your S3 key format
    };

    try {
      console.log(req.query, "heloooooooooooooooooooooooooooooo data");
      const { roomId, userId } = req.query;

      if (!roomId || !userId) {
        return res
          .status(400)
          .json({ message: "Missing required parameters: roomId or userId" });
      }

      const operation = "user-fetch-chat";

      const data = {
        userId: userId,
        roomId: roomId,
      };

      // Fetch the chat data
      const result: any = await chatRabbitMqClient.produce(data, operation);
      const result2: any = await userRabbitMqClient.produce(
        result,
        "chat-user-data"
      );

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
      console.log("senf ile ------------------------------", req.body);

      const operation = "chat-store-file";

      const data = req.body;
      // Fetch the chat data
      const result: any = await chatRabbitMqClient.produce(data, operation);

      return res.json(result);
    } catch (error) {
      console.log(error, "error in fetchChat");
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  myCourse: async (req: Request, res: Response) => {
    try {
      console.log(
        "my courseeeeeeee ------------------------------",
        req.params
      );

      const operation = "user-myCourse";

      const data = req.params;
      // Fetch the chat data
      const result: any = await userRabbitMqClient.produce(data, operation);

      console.log(result, "result1");

      const operation2 = "fetch-user-myCourse";

      const result2: any = await courseRabbitMqClient.produce(
        result,
        operation2
      );

      // console.log(result2, "------------result 2");

      return res.json(result2);
    } catch (error) {
      console.log(error, "error in fetchChat");
      return res.status(500).json({ message: "Internal server error" });
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

  report: async (req: Request, res: Response) => {
    try {
      console.log("senf ile ------------------------------", req.body);

      const operation = "report-course";

      const data = req.body;
      // Fetch the chat data
      const result: any = await courseRabbitMqClient.produce(data, operation);

      return res.json(result);
    } catch (error) {
      console.log(error, "error in fetchChat");
      return res.status(500).json({ message: "Internal server error" });
    }
  },




  fetchNotify: async (req: Request, res: Response) => {
    try {
        console.log("fetch Notify courseIds ------------------------------", req.query);

        const operation = "fetch-notification"; 

        // Ensure coursesEnrolled is an array of strings
        const coursesEnrolled = Array.isArray(req.query.coursesEnrolled)
            ? req.query.coursesEnrolled
            : [req.query.coursesEnrolled].filter(Boolean); // Convert single ID to array if needed

        // Format coursesEnrolled to have objects with roomId as keys
        const formattedCourses = coursesEnrolled.map((courseId) => ({
            roomId: courseId as string,
        }));

        const userId = req.query.userId;

        // Structure `data` with both `userId` and `coursesEnrolled`
        const data = {
            userId,
            coursesEnrolled: formattedCourses  // Use `coursesEnrolled` as an array within `data`
        };

        // Fetch the notification data
        const result: any = await chatRabbitMqClient.produce(data, operation);

        // Assuming result is an array of notification objects
        const notificationsWithS3Urls = await Promise.all(result.map(async (notification: any) => {
            // Replace the thumbnail field with the S3 URL
            const s3Url = await getS3SignedUrl(notification.thumbnail); // Await S3 URL generation
            return {
                ...notification, // Spread existing notification properties
                thumbnail: s3Url, // Replace thumbnail with S3 URL
            };
        }));

        console.log("Notification results:", notificationsWithS3Urls);

        return res.json(notificationsWithS3Urls);
    } catch (error) {
        console.error("Error in fetchNotify:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
},



updateReadStatus: async (req: Request, res: Response) => {
    try {
        console.log("fetch Notify courseIds ------------------------------", req.query);

        const data = req.query

        const operation = 'update-read-status';

        const result: any = await chatRabbitMqClient.produce(data, operation);

        console.log(result,"result ------------ of the chats")

        
    } catch (error) {
        console.error("Error in fetchNotify:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
},

  

updateReadUsers: async (req: Request, res: Response) => {
  try {
      console.log("nokikee kookiee------------------------------", req.query);

      const data = req.query;

      const operation = 'update-read-users';

      const result: any = await chatRabbitMqClient.produce(data, operation);

      console.log(result,"result ------------ of the chats")
    
      return res.json(result);
      
  } catch (error) {
      console.error("Error in fetchNotify:", error);
      return res.status(500).json({ message: "Internal server error" });
  }
},



fetchGroupMembers: async (req: Request, res: Response) => {
  try {
      console.log("fetch group daa------------------------------", req.query);

      const data = req.query;

      const operation = 'fetch-group-members';

      const result: any = await chatRabbitMqClient.produce(data, operation);

      console.log(result,"result ------------ of the chats")
      
      const operation2 = 'fetch-group-users';

      const result2: any = await userRabbitMqClient.produce(result, operation2);

      console.log(result,"result ------------ of the second chats")


      return res.json(result2);
      
  } catch (error) {
      console.error("Error in fetchNotify:", error);
      return res.status(500).json({ message: "Internal server error" });
  }
},




validateToken : async (req: Request, res: Response) => {
  try {
    console.log("111111122222Validating token...", req.body);

    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    jwt.verify(token, JWT_REFRESH_SECRET as string, (err:any, decoded:any) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          console.log('Token expired', err);
          return res.status(401).json({ success: false, message: 'Token expired' });
        } else {
          console.log('Invalid token', err);
          return res.status(403).json({ success: false, message: 'Invalid token' });
        }
      }

      // Type assertion to ensure decoded contains the required properties
      const { userId, email, role } = decoded as UserJwtPayload;

      // Generate a new access token
      const newAccessToken = jwt.sign(
        { userId, email, role },
        JWT_SECRET,
        { expiresIn: '1d' } // Set access token expiration
      );

      // Send the new access token to the frontend
      return res.status(200).json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error("Error in validateToken:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
},



reviewPost: async (req: Request, res: Response) => {
  try {
    console.log("REVIW POST ------------------------------", req.body);
    
    const data = req.body;
    const operation = 'store-review';
    const result: any = await courseRabbitMqClient.produce(data, operation);

    console.log(result, "result ------------ of the reviewpost");

    // Generate the new signed S3 URL

    if(result.success===true){
      const s3Url = await getS3SignedUrl(result.review.profilePicture);

      // Update the profilePicture inside the review object
      result.review.profilePicture = s3Url;
  
      // Return the modified result
      return res.json(result);
    }else{
      return res.json(result)
    }


  } catch (error) {
    console.error("Error in fetchNotify:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
},


fetchReview: async (req: Request, res: Response) => {
  try {
      console.log("REVIW fetchReview ------------------------------", req.params);
   
      const data = req.params;

      const operation = 'fetch-review';

      const result: any = await courseRabbitMqClient.produce(data, operation);

      console.log(result,"result ------------ of the fetchReview")

      const reviewsWithS3Urls = await Promise.all(result.reviews.map(async (review: any) => {
        // Replace the thumbnail field with the S3 URL
        const s3Url = await getS3SignedUrl(review.profilePicture); // Await S3 URL generation
        return {
            ...review, // Spread existing notification properties
            profilePicture: s3Url, // Replace thumbnail with S3 URL
        };
    }));

    console.log(reviewsWithS3Urls);
    
      return res.json(reviewsWithS3Urls);

  } catch (error) {
      console.error("Error in fetchNotify:", error);
      return res.status(500).json({ message: "Internal server error" });
  }
},


fetchTutor: async (req: Request, res: Response) => {
  try {
    console.log("TuToR vannu------------------------------", req.params);

    const { courseId } = req.params; // Assuming courseId is passed in the params
    const requestData = { courseId }; // Prepare the request object for gRPC

    // Call gRPC method to fetch tutor data
    const grpcResponse: any = await new Promise((resolve, reject) => {
      tutorClient.fetchTutor(requestData, (err: any, response: any) => {
        if (err) {
          return reject(err); // Reject the promise in case of error
        }
        resolve(response); // Resolve with the gRPC response
      });
    });

    console.log(grpcResponse, "result ------------ of the fetchTUTOR DETAISL");

    // Assuming there's only one tutor, directly access the first element of the response
    const tutor = grpcResponse.tutors[0]; // Get the first tutor from the array (assuming only one tutor is returned)

    // If there's a profile picture, replace it with the S3 signed URL
    if (tutor.profile_picture) {
      const s3Url = await getS3SignedUrl(tutor.profile_picture); // Await S3 URL generation
      tutor.profile_picture = s3Url; // Replace profile_picture with S3 URL
    }

    console.log("Final tutor data: ", tutor);

    return res.json(tutor); // Return the single tutor

  } catch (error) {
    console.error("Error in fetchTutor:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
},



};








