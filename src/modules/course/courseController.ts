import express, {Request, Response} from 'express'
import userRabbitMqClient from '../user/rabbitMQ/client'
import tutorRabbitMqClient from '../tutor/rabbitMQ/client'
import courseRabbitMqClient from './rabbitMQ/client'


export const courseController ={



    uploadCourse : async(req : Request, res : Response) => {
        try {
            
            console.log("entered --------------------- to the course part")

            const data = req.body;
            const operation ='upload-course'

            console.log(req.body, 'body data')


            const result: any = await courseRabbitMqClient.produce(data,operation)

            console.log(result, 'course result ---------upload thumbnail ');

            return res.json(result)
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
        }
    },


    userCourse : async(req : Request, res : Response) => {
        try {
            
            console.log("entered --------------------- to the course part")
            const operation ='user-course'



            const result: any = await courseRabbitMqClient.produce("",operation)

            console.log(result, 'course result ---------upload thumbnail ');

            return res.json(result)
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
        }
    },

    editCourse : async(req : Request, res : Response) => {
        try {
            
            console.log("entered --------------------- to the course part")

            const data = req.body;
            const operation ='edit-course'

            console.log(req.body, 'body data')


            const result: any = await courseRabbitMqClient.produce(data,operation)

            console.log(result, 'course result ---------edit thumbnail ');

            return res.json(result)
            
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Internal Server Error. Please try again later."
            })
        }
    },

}











