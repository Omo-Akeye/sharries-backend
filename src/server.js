import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import productRouter from './routes/productRoutes.js';
import userRouter from './routes/userRoutes.js';
import connectDB from './config/db.js';
import reviewRoute from './routes/reviewsRoute.js';
import orderRouter from './routes/orderRoutes.js';
import passport from 'passport';
import configurePassport from './config/passport.js';
import cookieParser from 'cookie-parser';


dotenv.config();
connectDB();

const app = express();
app.use(cookieParser());
app.use(express.json());

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://sharries.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

configurePassport();
app.use(passport.initialize());
app.use(express.json({limit: '50mb'}));
app.use('/', productRouter);
app.use('/', userRouter);
app.use('/',reviewRoute)
app.use('/',orderRouter)



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
