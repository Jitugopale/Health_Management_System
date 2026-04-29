import express from "express";
import { getChatHistoryController, getUserController, LoginController, RegisterPatientController, sendMessageController, UpdatePasswordController, UpdateUserController } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const authRouter = express.Router();

authRouter.post('/register/patient',RegisterPatientController)
authRouter.post('/login',LoginController)
authRouter.get('/getUser',authMiddleware,getUserController)
authRouter.put('/updateUser',authMiddleware,UpdateUserController)
authRouter.put('/updatePassword',authMiddleware,UpdatePasswordController)
authRouter.post('/sendMessage',authMiddleware,sendMessageController)
authRouter.get('/getMessages/:appointmentId',authMiddleware,getChatHistoryController)
export default authRouter;