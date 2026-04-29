import express from "express";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { CreateDoctorController, getAllBookedAppointmentscontroller, getAllCountsController, getAllDoctors, getAllPatients, getAllPendingAppointmentscontroller, getAllRejectedAppointmentscontroller } from "../controllers/adminController.js";
const adminRouter = express.Router();

adminRouter.post('/doctor/create',adminMiddleware,CreateDoctorController)
adminRouter.get('/appointments/pending/all',adminMiddleware,getAllPendingAppointmentscontroller)
adminRouter.get('/appointments/rejected/all',adminMiddleware,getAllRejectedAppointmentscontroller)
adminRouter.get('/appointments/booked/all',adminMiddleware,getAllBookedAppointmentscontroller)
adminRouter.get('/patients/all',adminMiddleware,getAllPatients)
adminRouter.get('/doctors/all',adminMiddleware,getAllDoctors)
adminRouter.get('/dashboard/counts',adminMiddleware,getAllCountsController)

export default adminRouter;