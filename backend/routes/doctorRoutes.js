import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { approveAppointmentController, getAllDoctorCountsController, getBookedAppointmentscontroller, getDoctorInfoController, getPendingAppointmentscontroller, getRejectedAppointmentscontroller, rejectAppointmentController, updateDoctorInfoController } from "../controllers/doctorController.js";
const doctorRouter = express.Router();

doctorRouter.put('/update/info',authMiddleware,updateDoctorInfoController)
doctorRouter.get('/get/info',authMiddleware,getDoctorInfoController)
doctorRouter.get('/appointments/pending',authMiddleware,getPendingAppointmentscontroller)
doctorRouter.put('/appointments/approve/:id',authMiddleware,approveAppointmentController)
doctorRouter.put('/appointments/reject/:id',authMiddleware,rejectAppointmentController)
doctorRouter.get('/appointments/reject/all',authMiddleware,getRejectedAppointmentscontroller)
doctorRouter.get('/appointments/booked/all',authMiddleware,getBookedAppointmentscontroller)
doctorRouter.get('/dashboard/counts',authMiddleware,getAllDoctorCountsController)

export default doctorRouter;