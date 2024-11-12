import express,{Request , Response} from "express";
import { useController } from './userController' 
import upload from '../../multer/multer'
import authencticateToken from '../../middleware/authMiddleware';

const userRouter = express.Router()



userRouter.get('/user',(req: Request, res:Response) => {
    res.status(200).json({success: true, message: 'sample test'})
})


userRouter.post('/register',useController.register)
userRouter.post('/verifyOtp',useController.verifyOtp)
userRouter.post('/login',useController.login)
userRouter.post('/resendOtp',useController.resendOtp)
userRouter.post('/forgotPassword',useController.forgotPassword)
userRouter.post('/forgotOtpVerify',useController.forgotOtpVerify)
userRouter.post('/resetPassword',useController.resetPassword)
userRouter.post('/google_login',useController.googleLogin)
userRouter.put('/profile',authencticateToken('user'),upload.single('profile_picture'),useController.profile)
userRouter.post('/',authencticateToken)
userRouter.get('/courseDetails/:courseId',authencticateToken('user'),useController.courseDetails)
userRouter.get('/allCourses',authencticateToken('user'),useController.allCourses)
userRouter.post('/payment',useController.payment)
userRouter.post('/orderSuccess',useController.orderSuccess)
userRouter.get("/getTutorDetails/:tutorId",authencticateToken('user'),useController.getTutorDetails)
userRouter.get("/getCourses/:userId",authencticateToken('user'),useController.getUserCourses)
userRouter.get("/fetchChat", authencticateToken('user'), useController.fetchChat);
userRouter.post("/sendFile",authencticateToken('user'),upload.single('file'),useController.sendFile)
userRouter.get("/myCourse/:userId",authencticateToken('user'),useController.myCourse)
userRouter.get('/courseView/:courseId',authencticateToken('user'),useController.courseView)
userRouter.post('/report',authencticateToken('user'),useController.report)
userRouter.get('/fetchNotify',authencticateToken('user'),useController.fetchNotify)
userRouter.get('/updateReadStatus',authencticateToken('user'),useController.updateReadStatus)
userRouter.get('/fetchGroupMembers',authencticateToken('user'),useController.fetchGroupMembers)
userRouter.post('/refresh-token',useController.validateToken)

export {userRouter}

