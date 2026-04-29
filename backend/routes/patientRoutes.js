import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { chatAgentController, getAllDoctorsController, getMyAppointmentscontroller, requestAppointmentController } from "../controllers/patientController.js";
const patientRouter = express.Router();

patientRouter.get('/doctors/getAll',authMiddleware,getAllDoctorsController)
patientRouter.post('/request/appointment',authMiddleware,requestAppointmentController)
patientRouter.get('/myAppointments',authMiddleware,getMyAppointmentscontroller)
patientRouter.post('/agent/chat',authMiddleware,chatAgentController)

export default patientRouter;