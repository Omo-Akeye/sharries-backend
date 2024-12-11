import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import productRouter from './routes/productRoutes.js';
import userRouter from './routes/userRoutes.js';
import connectDB from './config/db.js';
import reviewRoute from './routes/reviewsRoute.js';
import orderRouter from './routes/orderRoutes.js';
// import priceRouter from './routes/priceRoute.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use('/', productRouter);
app.use('/', userRouter);
// app.use('/', priceRouter);
app.use('/',reviewRoute)
app.use('/',orderRouter)



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
