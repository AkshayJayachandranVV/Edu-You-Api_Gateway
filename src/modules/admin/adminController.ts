import express, {Request, Response} from 'express'
import adminRabbitMqClient from './rabbitMQ/client'
import userRabbitMqClient from '../user/rabbitMQ/client'
import tutorRabbitMqClient from '../tutor/rabbitMQ/client'
import courseRabbitMqClient from '../course/rabbitMQ/client'
import orderRabbitMqClient from '../order/rabbitMQ/client'
import {jwtCreate} from '../../jwt/jwtCreate'  
import { adminClient } from './grpc/services/client';
import { getS3SignedUrl } from '../../s3SignedUrl/grtS3SignedUrl'
import {courseClient} from '../course/grpc/service/client'
import config from "../../config/config";
import jwt from 'jsonwebtoken';


interface GrpcError extends Error {
    details?: string; // Adding details property
}


interface JwtPayload {
    adminId: string;
    email: string;
    role: string;
  }
  
  
  interface UserJwtPayload extends JwtPayload {
    adminId: string;
    email: string;
    role: string;
  }
  
  
  const JWT_SECRET = config.jwt_key;
  const JWT_REFRESH_SECRET =  config.jwt_refresh_key;

export const adminController ={



    login: async (req: Request, res: Response) => {
        try {
            console.log("Entered to the login admin", req.body);
    
            const data = req.body; // Get the login data from the request body
    
            // Call the gRPC login method for admin
            adminClient.login(data, (error: GrpcError | null, result: any) => {
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
                        id: result.adminData.id,  // Accessing the admin ID from the result
                        email: result.adminData.email,
                        role: result.adminData.role
                    };
    
                    console.log(payload, "here important admin id and email");
    
                    // Generate tokens
                    const { accessToken, refreshToken } = jwtCreate(payload);
                    console.log(accessToken, refreshToken, "got the tokens");
    
                    // Return successful login response
                    return res.json({
                        success: true,
                        message: 'Login successful',
                        adminData: result.adminData, // Include adminData from the gRPC response
                        adminId: result.adminData.id, // Assuming adminData contains id
                        role: result.role,
                        adminAccessToken: accessToken,
                        adminRefreshToken: refreshToken
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
    


    students: async (req: Request, res: Response) => {
        try {
            console.log("Entered to the students list ", req.query);
    
            const data = req.query;
            const operation = 'admin-students';
    
            
            const result: any = await userRabbitMqClient.produce(data, operation);
    
            console.log(result, 'admin result ------------- total-------students ');
    
            
            const updatedUsers = result.users.map((user: any) => {
                if (user.profile_picture) {
                    user.profile_picture = getS3SignedUrl(user.profile_picture); 
                }
                return user;
            });
            result.users = updatedUsers;
    
           
            return res.json(result);
    
        } catch (error) {
            console.error("Error fetching students data: ", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            });
        }
    },

    isBlocked : async(req : Request, res : Response) => {
        try {

            console.log("Entered to the isBlocked ",req.body)

            const data = req.body
                
            const operation = 'admin-isBlocked'

            const result: any = await userRabbitMqClient.produce(data,operation)

            console.log(result, 'admin result ------------- isBlocked-------students ');

            return res.json(result)
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
        }
    },


    tutors: async (req: Request, res: Response) => {
        try {
            console.log("Entered to the tutors list ", req.query);
    
            const data = req.query;
            const operation = 'admin-tutors';
    
            // Get the result from the RabbitMQ client
            const result: any = await tutorRabbitMqClient.produce(data, operation);
    
            console.log(result, 'admin result ------------- total-------tutors ');
            
            const updatedTutors = result.tutors.map((tutor: any) => {
                if (tutor.profile_picture) {
                    tutor.profile_picture = getS3SignedUrl(tutor.profile_picture); 
                }
                return tutor;
            });
            result.tutors = updatedTutors;
    
            return res.json(result);
    
        } catch (error) {
            console.error("Error fetching tutors data: ", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            });
        }
    },


    tutorsIsBlocked : async(req : Request, res : Response) => {
        try {

            console.log("Entered to the isBlocked ",req.body)

            const data = req.body
                
            const operation = 'admin-tutorIsBlocked'

            const result: any = await tutorRabbitMqClient.produce(data,operation)

            console.log(result, 'admin result ------------- isBlocked-------tutors ');

            return res.json(result)
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
        }
    },


    courses : async (req: Request, res: Response): Promise<void> => {
        try {
            console.log("Entered to the courses list ", req.query);
    
            // Prepare the gRPC request data from req.query
            const data = req.query;
    
            // Call the gRPC function adminClient.allCourse
            courseClient.allCourses(data, (error: any, result: any) => {
                if (error) {
                    console.error("Error in adminClient.allCourse:", error);
                    return res.status(500).json({
                        success: false,
                        message: "Internal Server Error. Please try again later.",
                    });
                }
    
                console.log(result, "admin result ------------- total-------courses ");
                return res.json(result);
            });
        } catch (error) {
            console.error("Error in courses function:", error);
        }
    },


    listCourses : async(req : Request, res : Response) => {
        try {

            console.log("Entered to the tutors list ")
    
            const operation = 'admin-courses-list'

            console.log(req.body,"---------------req.body in listCourses")

            const data = req.body

            const result: any = await courseRabbitMqClient.produce(data,operation)

            // console.log(result, 'admin result ------------- total-------tutors ');

            return res.json(result)
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
        }
    },


    reportCourses : async(req : Request, res : Response) => {
        try {

            console.log("Entered to the tutors list ")
    
            const operation = 'admin-report-courses'

            console.log(req.body,"---------------req.body in listCourses")

            const data = req.body

            const result: any = await courseRabbitMqClient.produce(data,operation)

            // console.log(result, 'admin result ------------- total-------tutors ');

            return res.json(result)
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
        }
    },




    validateToken : async (req: Request, res: Response) => {
        try {
          console.log("adminnn111111122222Validating token...", req.body);
      
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
            const { adminId, email, role } = decoded as UserJwtPayload;
      
            // Generate a new access token
            const newAccessToken = jwt.sign(
              { adminId, email, role },
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

    
      payouts : async(req : Request, res : Response) => {
        try {

            console.log("Entered to the tutors list ",req.query)

            const data= req.query
    
            const operation = 'admin-payouts'

            const result: any = await orderRabbitMqClient.produce(data,operation)

            console.log(result, 'admin result');

            const operation2 = 'admin-payout-tutor'

            const result2:any = await tutorRabbitMqClient.produce(result.orders,operation2)

            // console.log("1")
            // console.log(result2)
            result.orders =  result2
            const operation3 = 'admin-payout-user'

            const result3:any = await userRabbitMqClient.produce(result2,operation3)

            console.log("232")
            console.log(result3)


            const payoutsWithS3Urls = await Promise.all(result3.userData.map(async (item: any) => {
                // Replace the thumbnail field with the S3 URL
                const s3Url = await getS3SignedUrl(item.thumbnail); // Await S3 URL generation
                return { ...item, thumbnail: s3Url }; // Return the updated item
            }));

            console.log("testinh",payoutsWithS3Urls)

            return res.json({totalCount:result.totalOrders,orders:payoutsWithS3Urls})
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
        }
    },



    graphData: async (req: Request, res: Response) => {
        try {
            console.log("Fetching user data:");
            const operation1 = 'admin-bargraph-data';
            const operation2 = 'admin-piegraph-data';
    
            // Call both RabbitMQ clients to retrieve data
            const resultBar: any = await orderRabbitMqClient.produce({}, operation1);
            console.log("first reply",resultBar)
            const resultPie: any = await orderRabbitMqClient.produce({},operation2);
            console.log("sedon reply",resultPie)
    

            console.log("00000000000000000000000000",resultBar,resultPie,"--------------------------------------")
            const combinedResult = {
                barGraph: resultBar,
                pieGraph: resultPie,
            };
    
            return res.json(combinedResult);
        } catch (error) {
            console.log(error, "Error in cardsData");
            res.status(500).json({ error: "Failed to retrieve tutor data" });
        }
    },


    cardsData: async (req: Request, res: Response) => {
        try {
            console.log("cardsData level data:");
            const operation1 = 'admin-total-profit';
            const operation2 = 'admin-total-courses';
            const operation3 = 'admin-total-users';
    
            // Call both RabbitMQ clients to retrieve data
            const result1: any = await orderRabbitMqClient.produce({}, operation1);
            console.log("first reply",result1)
            const result2: any = await courseRabbitMqClient.produce({},operation2);
            console.log("sedon reply",result2)

            const result3: any = await userRabbitMqClient.produce({},operation3);
            console.log("sedon reply",result3)
    

            console.log("00000000000000000000000000----",result1,result2,result3,"--------------------------------------")
            const combinedResult = {
                totalProfit:result1,
                totalCourses:result2,
                totalStudents:result3
            };
    
            return res.json(combinedResult);
        } catch (error) {
            console.log(error, "Error in cardsData");
            res.status(500).json({ error: "Failed to retrieve tutor data" });
        }
    },


}


