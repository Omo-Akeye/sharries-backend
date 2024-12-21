import express from 'express';
import {  register,login,logOut } from '../controllers/authControllers.js';


const userRouter = express.Router();

userRouter.post('/register', register);
userRouter .post('/login', login);
userRouter .post('/logout', logOut);

export default userRouter;
