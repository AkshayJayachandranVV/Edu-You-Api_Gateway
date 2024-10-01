import express from 'express'
import http from 'http'
import logger from './utils/logger'
import dotenv from 'dotenv'
import config from './config/config'
import cors,{ CorsOptions } from 'cors'
import cookieParser from 'cookie-parser'
import {userRouter} from './modules/user/userRoute'
import {tutorRouter} from './modules/tutor/tutorRoute'
import {adminRouter} from './modules/admin/adminRoute'
import {courseRouter} from './modules/course/courseRoute'
dotenv.config()
const app = express()

const corsOptions: CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allowed?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin || origin === "http://localhost:5173") {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true, 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Use array instead of a comma-separated string
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"], // Add any other headers your app might need
    preflightContinue: false,
    optionsSuccessStatus: 204 // For legacy browser support
};


app.use(cors(corsOptions));


app.use(cookieParser())
app.use(express.json())


app.use("/",userRouter)
app.use("/tutor",tutorRouter)
app.use("/admin",adminRouter)
app.use("/course",courseRouter)


const server = http.createServer(app)


const startServer = async () => {
    try{
        console.log(`Config port: ${config.port} `,'-------',typeof(process.env.PORT))
        server.listen(config.port,()=>{
            logger.info(`Service is running on port ${config.port}`)
        })
    }catch(error){
        logger.error('Something went wrong ->', error);
    }
}



startServer()







