import express,{Request , Response} from "express";
import {tutorController} from './tutorController'; 
import authencticateToken from '../../middleware/authMiddleware';
import upload from '../../multer/multer'


const tutorRouter = express.Router()

tutorRouter.post("/register",tutorController.register)
tutorRouter.post("/verifyOtp",tutorController.verifyOtp)
tutorRouter.post("/resendOtp",tutorController.resendOtp)
tutorRouter.post("/login",tutorController.login)
tutorRouter.post("/forgotPassword",tutorController.forgotPassword)
tutorRouter.post("/forgotOtpVerify",tutorController.forgotOtpVerify)
tutorRouter.post("/resetPassword",tutorController.resetPassword)
tutorRouter.post("/google_login",tutorController.tutorGoogleLogin)
tutorRouter.get("/getPresignedUrlForUpload",tutorController.getPresignedUrlForUpload)
tutorRouter.get("/myCourses/:tutorId",authencticateToken('tutor'),tutorController.myCourses)
tutorRouter.get("/listCourse/:courseId",authencticateToken('tutor'),tutorController.listCourse)
tutorRouter.get("/fetchEditCourse/:courseId",authencticateToken('tutor'),tutorController.fetchEditCourse)
tutorRouter.put("/editProfile",authencticateToken('tutor'),upload.single('profile_picture'),tutorController.editProfile)
tutorRouter.post("/getSignedUrlId",tutorController.getSignedUrl)
tutorRouter.get("/getTutorDetails/:tutorId",tutorController.getTutorDetails)
tutorRouter.get("/payouts/:tutorId",authencticateToken('tutor'),tutorController.payouts)
tutorRouter.get("/courseStudents/:courseId",authencticateToken('tutor'),tutorController.courseStudents)
tutorRouter.get("/getPresignedUrl",tutorController.getPresignedUrl)
tutorRouter.get("/cardsData/:tutorId",tutorController.cardsData)
tutorRouter.get("/graphData/:tutorId",tutorController.graphData)
export {tutorRouter}


