import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit'; 
import configurePassport from './config/passport.js';
import connectDB from './config/db.js';
import productRouter from './routes/productRoutes.js';
import userRouter from './routes/userRoutes.js';
import reviewRoute from './routes/reviewsRoute.js';
import orderRouter from './routes/orderRoutes.js';
import cron from 'node-cron';

dotenv.config();
connectDB();

const app = express();

app.use(express.json({ limit: '50mb' })); 
app.use(cookieParser()); 


app.set('trust proxy', 1);


app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Server is alive'
  });
});

const allowedOrigins = ['https://sharries.vercel.app'];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.options('*', cors());
configurePassport();
app.use(passport.initialize());

// Single rate limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true, 
  legacyHeaders: false, 
  keyGenerator: (req) => {
    
    return req.user?.id || ipKeyGenerator(req);
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.round(15 * 60) 
    });
  },
});


app.use(limiter);


app.use('/', productRouter);
app.use('/', userRouter);
app.use('/', reviewRoute);
app.use('/', orderRouter);


app.use((err, req, res, next) => {
  if (err.status === 429) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests, please slow down.',
      retryAfter: err.retryAfter
    });
  }
  next(err);
});

const PORT = process.env.PORT || 6010;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Rate limiting enabled: 100 requests per 15 minutes');

  cron.schedule('*/10 * * * *', async () => {
    try {
      const serverUrl = process.env.SERVER_URL || `http://localhost:${PORT}`;
      console.log(`[${new Date().toISOString()}] Attempting to ping: ${serverUrl}/health`);
      
      const response = await fetch(`${serverUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Node.js Keep-Alive Bot'
        },
        signal: AbortSignal.timeout(15000) 
      });
      
      console.log(`[${new Date().toISOString()}] Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const textResponse = await response.text();
        console.error(`[${new Date().toISOString()}] HTTP ${response.status} Error Response:`, textResponse.substring(0, 300));
        return;
      }
      
      const contentType = response.headers.get('content-type');
      console.log(`[${new Date().toISOString()}] Content-Type: ${contentType}`);
      
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error(`[${new Date().toISOString()}] Expected JSON but got ${contentType}:`);
        console.error('Response body:', textResponse.substring(0, 500));
        
        if (textResponse.includes('<!DOCTYPE') || textResponse.includes('<html')) {
          console.error('Received HTML response - possibly a Render error page or the app is starting up');
        }
        return;
      }
      
      const data = await response.json();
      console.log(`[${new Date().toISOString()}] ✅ Cron ping successful:`, data.message);
    } catch (error) {
      if (error.name === 'TimeoutError') {
        console.error(`[${new Date().toISOString()}] ⌛ Cron ping timed out after 15 seconds (Render cold start?))`);
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error(`[${new Date().toISOString()}] ❌ Network error - server might be down:`, error.message);
      } else if (error.message.includes('Unexpected token')) {
        console.error(`[${new Date().toISOString()}] ❌ Received non-JSON response (likely HTML error page)`);
      } else {
        console.error(`[${new Date().toISOString()}] ❌ Cron ping failed:`, error.message);
      }
    }
  });
  
  console.log('Cron job scheduled: Server will be pinged every 10 minutes');
});