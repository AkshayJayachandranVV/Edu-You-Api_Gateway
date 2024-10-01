import express,{Request , Response} from "express";
import {tutorController} from './tutorController'; 


const tutorRouter = express.Router()

tutorRouter.post("/register",tutorController.register)
tutorRouter.post("/verifyOtp",tutorController.otp)
tutorRouter.post("/resendOtp",tutorController.resendOtp)
tutorRouter.post("/login",tutorController.login)
tutorRouter.post("/forgotPassword",tutorController.forgotPassword)
tutorRouter.post("/forgotOtpVerify",tutorController.forgotOtpVerify)
tutorRouter.post("/resetPassword",tutorController.resetPassword)
tutorRouter.post("/google_login",tutorController.tutorGoogleLogin)
tutorRouter.get("/getPresignedUrlForUpload",tutorController.getPresignedUrlForUpload)
// tutorRouter.get("/getSignedUrl",tutorController.getSignedUrl)



export {tutorRouter}


