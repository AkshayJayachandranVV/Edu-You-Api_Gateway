import express, {Request, Response} from 'express'
import adminRabbitMqClient from './rabbitMQ/client'
import userRabbitMqClient from '../user/rabbitMQ/client'
import tutorRabbitMqClient from '../tutor/rabbitMQ/client'
import courseRabbitMqClient from '../course/rabbitMQ/client'
import {jwtCreate} from '../../jwt/jwtCreate'  


export const adminController ={



    login : async(req : Request, res : Response) =>{
        try {
            
            console.log("Entered to the login user",req.body)
    
            const data = req.body
    
            const operation = 'login_admin'
    
            const result: any = await adminRabbitMqClient.produce(data,operation)
    
            console.log(result, 'successfully logged in');
    
            if(result.success == true){
    
                    const payload = {id:result.adminData.id, email : result.adminData.email, role :"admin"}
    
                  const {accessToken,refreshToken} = jwtCreate(payload)

                  console.log(accessToken,refreshToken)
    
                   
    
                    return res.json({
                        success: true,
                        message: 'Login successful',
                        userId: result.userId,
                        role: result.role,
                        adminAccessToken : accessToken,
                        adminRefreshToken : refreshToken
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








