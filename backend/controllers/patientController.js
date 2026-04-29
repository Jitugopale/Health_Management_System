import { getPool, sql } from "../db/db.js"
import { handleHealthQuery } from "../services/healthAgent.js";

const generateAppointmentId = async (pool) => {
  const result = await pool.request().query(`
        SELECT TOP 1 appointmentId
        FROM appointments
        where appointmentId LIKE 'APP%'
        ORDER BY id DESC`);

  if (result.recordset.length === 0) {
    return "APP001";
  }

  const lastId = result.recordset[0].appointmentId;
  const numericPart = parseInt(lastId.slice(3));
  const newNumericPart = (numericPart + 1).toString().padStart(3, "0");
  return `APP${newNumericPart}`;

}

export const getAllDoctorsController = async(req,res)=>{
    try {
        if(req.user.role !== "PATIENT" && req.user.role !=="Admin"){
            return res.status(401).json({message:"Only patients or admins can access this feature"})
        }

        const pool = await getPool();
        const getDoctorsRequest = pool.request();

        const doctors = await getDoctorsRequest.query(`
            SELECT doctorId,name,specialization, qualification,email,phoneNo FROM doctors
            `)

            if(doctors.recordset.length === 0){
                return res.status(404).json({message:"No Doctors Found"})
            }

            return res.status(200).json({message:"Doctors Fetched Successfully",
                data:doctors.recordset
            })
    } catch (error) {
        console.error("Error Fetching doctors",error)
        return res.status(500).json({message:"Something Went Wrong"})
    }
}

export const requestAppointmentController = async(req,res)=>{
    try {
        const role = req.user.role;
        const patientUserId = req.user.id;

        if(role !== "PATIENT"){
            return res.status(401).json({message:"only patients can request appointment"})
        }

        const {doctorId} = req.body;

        if(!doctorId){
            return res.status(400).json({message:"Doctor Id is required"})
        }

        const pool = await getPool();
        
        const doctorResult = await pool
        .request()
        .input("doctorId",sql.VarChar,doctorId)
        .query(`SELECT doctorId FROM doctors WHERE doctorId = @doctorId`)

        if(doctorResult.recordset.length === 0){
            return res.status(404).json({message:"Doctor not found"})
        }

        const appointmentId = await generateAppointmentId(pool);

        const insertResult = await pool
        .request()
        .input("appointmentId",sql.VarChar,appointmentId)
        .input("patientId",sql.VarChar,patientUserId)
        .input("doctorId",sql.VarChar,doctorId)
        .query(`
            INSERT INTO appointments (appointmentId, status, patientId, doctorId)
            OUTPUT INSERTED.id, INSERTED.appointmentId, INSERTED.date, INSERTED.time, INSERTED.status, INSERTED.notes, INSERTED.patientId, INSERTED.doctorId, INSERTED.createdAt

            VALUES(@appointmentId,'PENDING',@patientId,@doctorId)
            `)

            return res.status(201).json({
                message:"Appointment request created successfully",
                appointment : insertResult.recordset[0]
            })
    } catch (error) {
        return res.status(500).json({message:"Something went wrong"})
        
    }
}

export const getMyAppointmentscontroller = async(req,res)=>{
    try {
        if(req.user.role !== "PATIENT"){
            return res.status(401).json({message:"Only patients can access this"})
        }

        const pool = await getPool();

        const result = await pool.request()
         .input("patientId",sql.VarChar,req.user.id)
         .query(`
            SELECT
            a.id,
            a.appointmentId,
            a.date,
            a.time,
            a.status,
            a.notes,
            a.patientId,
            a.doctorId,
            a.createdAt,

            -- Patient Info
            p.userId AS p_userId,
            p.name AS p_name,
            p.email AS p_email,
            p.phoneNo AS p_phoneNo,
            p.gender AS p_gender,
            p.age AS p_age,

            -- Doctor Info
            d.doctorId AS d_doctorId,
            d.name AS d_name,
            d.email AS d_email,
            d.phoneNo AS d_phoneNo,
            d.specialization AS d_specialization,
            d.experience AS d_experience,
            d.qualification AS d_qualification

            FROM appointments a
            INNER JOIN users p ON a.patientId = p.userId
            INNER JOIN doctors d ON a.doctorId = d.doctorId
            WHERE a.patientId = @patientId
            ORDER BY a.createdAt DESC
            `)

            const formattedAppointments = result.recordset.map((row)=>({
                id:row.id,
                appointmentId:row.appointmentId,
                date:row.date,
                time:row.time,
                status:row.status,
                notes:row.notes,
                createdAt:row.createdAt,
                
                patient:{
                    userId : row.p_userId,
                    name : row.p_name,
                    email : row.p_email,
                    phoneNo : row.p_phoneNo,
                    gender : row.p_gender,
                    age : row.p_age,
                },
                doctor:{
                    userId:row.d_doctorId,
                    name:row.d_name,
                    email:row.d_email,
                    phoneNo:row.d_phoneNo,
                    specialization:row.d_specialization,
                    experience:row.d_experience,
                    qualification:row.d_qualification,
                }
            }))

            return res.status(200).json({
                message:"Appointments fetched successfully",
                appointments : formattedAppointments
            })
    } catch (error) {
         return res.status(500).json({message:"Something went wrong"})
    }
}

export const chatAgentController = async(req,res)=>{
     if(req.user.role !== "PATIENT"){
            return res.status(401).json({message:"Only patients can access this"})
        }

        const {message} = req.body;
        
        if(!message){
            return res.status(400).json({message:"Message is required"})
        }

        try {
            const result = await handleHealthQuery(message);

            return res.status(200).json({
                reply:result.answer,
                source: result.source
            })
        } catch (error) {
            return res.status(500).json({message:"Something went wrong"})
        }
}