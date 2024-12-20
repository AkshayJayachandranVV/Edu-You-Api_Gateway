import express, { Request, Response } from "express";
import { adminController } from './adminController';
import authenticationToken from '../../middleware/authMiddleware';

const adminRouter = express.Router();

// Public route (no authentication required)
adminRouter.post("/login", adminController.login);

// Role-based protected routes (only accessible by users with "admin" role)
adminRouter.get("/students", authenticationToken('admin'), adminController.students);
adminRouter.post("/isBlocked", authenticationToken('admin'), adminController.isBlocked);
adminRouter.get("/tutors", authenticationToken('admin'), adminController.tutors);
adminRouter.post("/tutorIsBlocked", authenticationToken('admin'), adminController.tutorsIsBlocked);
adminRouter.get("/courses", authenticationToken('admin'), adminController.listCourses);
adminRouter.post("/listCourse", authenticationToken('admin'), adminController.listCourses);
adminRouter.get("/reportCourses", authenticationToken('admin'), adminController.reportCourses);
adminRouter.get("/payouts", authenticationToken('admin'), adminController.payouts);
adminRouter.get("/graphData", authenticationToken('admin'), adminController.graphData);
adminRouter.get("/cardsData", authenticationToken('admin'), adminController.cardsData);
adminRouter.get("/listUnlist/:courseId", authenticationToken('admin'), adminController.listUnlist);
adminRouter.post('/refresh-token',adminController.validateToken)
export { adminRouter };

