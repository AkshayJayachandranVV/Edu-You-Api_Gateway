import express from 'express';
import http from 'http';
import logger from './utils/logger';
import dotenv from 'dotenv';
import config from './config/config';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import { userRouter } from './modules/user/userRoute';
import { tutorRouter } from './modules/tutor/tutorRoute';
import { adminRouter } from './modules/admin/adminRoute';
import { courseRouter } from './modules/course/courseRoute';
import { initializeSocket } from './socket/socketServer'; // Import the socket initializer

dotenv.config();
const app = express();

const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allowed?: boolean) => void) => {
    if (!origin || origin === config.client_url) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Routers
app.use('/', userRouter);
app.use('/tutor', tutorRouter);
app.use('/admin', adminRouter);
app.use('/course', courseRouter);

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server); // Call the socket initializer function

// Start the server
const startServer = async () => {
  try {
    console.log(`Config port: ${config.port}`, '-------', typeof process.env.PORT);
    server.listen(config.port, () => {
      logger.info(`Service is running on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Something went wrong ->', error);
  }
};

startServer();
