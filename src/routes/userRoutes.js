// import express from "express";
// import { register, login, logout,  checkAuth, userTotalSpent, isAuthenticated, getProfile } from "../controllers/authControllers.js";
// import { authenticateJWT } from "../middlewares/auth.js";

// const userRouter = express.Router();

// userRouter.post("/register", register);
// userRouter.post("/login", login);
// userRouter.post("/user/total-spent", isAuthenticated,userTotalSpent);
// userRouter.post("/logout", logout);
// userRouter.get("/check-auth", authenticateJWT, checkAuth);
// userRouter.get("/user-profile", getProfile ,authenticateJWT);

// export default userRouter;
import express from "express";
import { 
  register, 
  login, 
  logout,  
  checkAuth, 
  userTotalSpent, 
  isAuthenticated, 
  getProfile 
} from "../controllers/authControllers.js";
import { authenticateJWT } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/user/total-spent", isAuthenticated, userTotalSpent);
userRouter.post("/logout", logout);
userRouter.get("/check-auth", authenticateJWT, checkAuth);
userRouter.get("/user-profile", authenticateJWT, getProfile); 

export default userRouter;