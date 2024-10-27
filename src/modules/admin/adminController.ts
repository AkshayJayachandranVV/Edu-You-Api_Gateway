import express, {Request, Response} from 'express'
import adminRabbitMqClient from './rabbitMQ/client'
import userRabbitMqClient from '../user/rabbitMQ/client'
import tutorRabbitMqClient from '../tutor/rabbitMQ/client'
import courseRabbitMqClient from '../course/rabbitMQ/client'
import {jwtCreate} from '../../jwt/jwtCreate'  
import { adminClient } from './grpc/services/client';


interface GrpcError extends Error {
    details?: string; // Adding details property
}

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
                        role: result.role
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
    


    students : async(req : Request, res : Response) => {
        try {

            console.log("Entered to the students list ")
    
            const operation = 'admin-students'

            const result: any = await userRabbitMqClient.produce('',operation)

            // console.log(result, 'admin result ------------- total-------students ');

            return res.json(result)
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
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


    tutors : async(req : Request, res : Response) => {
        try {

            console.log("Entered to the tutors list ")
    
            const operation = 'admin-tutors'

            const result: any = await tutorRabbitMqClient.produce('',operation)

            // console.log(result, 'admin result ------------- total-------tutors ');

            return res.json(result)
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
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


    courses : async(req : Request, res : Response) => {
        try {

            console.log("Entered to the tutors list ")
    
            const operation = 'admin-courses'

            const result: any = await courseRabbitMqClient.produce('',operation)

            // console.log(result, 'admin result ------------- total-------tutors ');

            return res.json(result)
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
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

}








