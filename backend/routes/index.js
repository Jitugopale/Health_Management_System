import express from "express";
import authRouter from "./authRoutes.js";
import adminRouter from "./adminRoutes.js";
import doctorRouter from "./doctorRoutes.js";
import patientRouter from "./patientRoutes.js";

const rootRouter = express.Router();

rootRouter.use('/auth',authRouter)
rootRouter.use('/admin',adminRouter)
rootRouter.use('/doctor',doctorRouter)
rootRouter.use('/patient',patientRouter)

export default rootRouter;