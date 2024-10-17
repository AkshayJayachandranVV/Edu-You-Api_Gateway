import express, { Request, Response } from "express";
import { courseController } from './courseController';
import upload from '../../multer/multer'
import authenticationToken from '../../middleware/authMiddleware';

const courseRouter = express.Router();

// Public route (no authentication required)
courseRouter.post("/uploadCourse", courseController.uploadCourse);
courseRouter.post("/editCourse", courseController.editCourse);
courseRouter.get("/userCourse", courseController.userCourse);
export { courseRouter };
