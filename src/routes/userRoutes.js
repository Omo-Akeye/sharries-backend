import express from 'express';
import {  register,login,logout, isAuthenticated, checkAuth,  } from '../controllers/authControllers.js';



const userRouter = express.Router();

userRouter.post('/register', register);
userRouter .post('/login', login);
userRouter .post('/logout', logout,isAuthenticated);
userRouter.get('/check-auth', isAuthenticated, checkAuth)


export default userRouter;
