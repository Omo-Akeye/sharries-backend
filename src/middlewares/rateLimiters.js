import { rateLimit } from 'express-rate-limit';

// Stricter limiter for auth endpoints to slow down credential stuffing/brute force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'Too many attempts. Please try again later.',
      retryAfter: Math.round(15 * 60)
    });
  },
});
