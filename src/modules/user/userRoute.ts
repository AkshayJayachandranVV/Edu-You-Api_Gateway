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






export {userRouter}