import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import configurePassport from './config/passport.js';
import connectDB from './config/db.js';
import productRouter from './routes/productRoutes.js';
import userRouter from './routes/userRoutes.js';
import reviewRoute from './routes/reviewsRoute.js';
import orderRouter from './routes/orderRoutes.js';

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' })); // Parse JSON body
app.use(cookieParser()); // Parse cookies

// CORS Configuration
const allowedOrigins = ['http://localhost:3000', 'https://sharries.vercel.app'];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Handle CORS preflight requests
app.options('*', cors());

// Passport Initialization
configurePassport();
app.use(passport.initialize());

// Routes
app.use('/', productRouter);
app.use('/', userRouter);
app.use('/', reviewRoute);
app.use('/', orderRouter);

// Server Setup
const PORT = process.env.PORT || 6010;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
