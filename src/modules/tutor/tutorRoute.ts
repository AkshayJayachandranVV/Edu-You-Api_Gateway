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
tutorRouter.post("/addInformation",tutorController.addInformation)
tutorRouter.post("/resetPassword",tutorController.resetPassword)
tutorRouter.post("/google_login",tutorController.tutorGoogleLogin)
tutorRouter.get("/getPresignedUrlForUpload",tutorController.getPresignedUrlForUpload)
tutorRouter.get("/myCourses",authencticateToken('tutor'),tutorController.myCourses)
tutorRouter.get("/listCourse",authencticateToken('tutor'),tutorController.listCourse)
tutorRouter.get("/fetchEditCourse/:courseId",authencticateToken('tutor'),tutorController.fetchEditCourse)
tutorRouter.put("/editProfile",authencticateToken('tutor'),upload.single('profile_picture'),tutorController.editProfile)
tutorRouter.post("/getSignedUrlId",tutorController.getSignedUrl)
tutorRouter.get("/getTutorDetails/:tutorId",authencticateToken('tutor'),tutorController.getTutorDetails)
tutorRouter.get("/payouts",authencticateToken('tutor'),tutorController.payouts)
tutorRouter.get("/courseStudents/:courseId",authencticateToken('tutor'),tutorController.courseStudents)
tutorRouter.get("/getPresignedUrl",tutorController.getPresignedUrl)
tutorRouter.get("/cardsData/:tutorId",authencticateToken('tutor'),tutorController.cardsData)
tutorRouter.get("/graphData/:tutorId",authencticateToken('tutor'),tutorController.graphData)
tutorRouter.get('/courseView/:courseId',authencticateToken('tutor'),tutorController.courseView)
tutorRouter.get("/getCourses/:userId",authencticateToken('tutor'),tutorController.getUserCourses)
tutorRouter.get("/profileDetails/:tutorId",authencticateToken('tutor'),tutorController.profileDetails)
tutorRouter.get("/listUnlist/:courseId",authencticateToken('tutor'),tutorController.listUnlist)
tutorRouter.get("/getTutorCourses/:userId",authencticateToken('tutor'),tutorController.getTutorCourses)
tutorRouter.post('/refresh-token',tutorController.validateToken)

export {tutorRouter}


