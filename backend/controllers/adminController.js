import { hashSync } from "bcrypt";
import { getPool, sql } from "../db/db.js";
import { SendEmail } from "../services/gmail.js";

const generateDoctorUserId = async (pool) => {
  const result = await pool.request().query(`
        SELECT TOP 1 userId
        FROM users
        where role = 'DOCTOR' AND userId LIKE 'DOC%' 
        ORDER BY id DESC`);

  if (result.recordset.length === 0) {
    return "DOC001";
  }

  const lastId = result.recordset[0].userId;
  const numericPart = parseInt(lastId.slice(3));
  const newNumericPart = (numericPart + 1).toString().padStart(3, "0");
  return `DOC${newNumericPart}`;
};

export const generateRandomPassword = (length = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }
  return password;
};

export const CreateDoctorController = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(401).json({ message: "Access Denied" });
    }

    const { name, email, specialization, experience, qualification, phoneNo } =
      req.body;

    if (
      !name ||
      !email ||
      !specialization ||
      !experience ||
      !qualification ||
      !phoneNo
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const pool = await getPool();
    const adminRequest = pool.request();
    const result = await adminRequest.input("email", sql.VarChar, email).query(`
            SELECT * FROM users WHERE email = @email
            `);

    const user = result.recordset[0];

    if (user) {
      return res
        .status(404)
        .json({ message: "Doctor already exists with this email" });
    }

    const userId = await generateDoctorUserId(pool);

    const password = await generateRandomPassword();

    const hashPassword = hashSync(password, 10);

    const users = await pool
      .request()
      .input("name", sql.VarChar, name)
      .input("userId", sql.VarChar, userId)
      .input("email", sql.VarChar, email)
      .input("password", sql.VarChar, hashPassword)
      .input("phoneNo", sql.VarChar, phoneNo).query(`
        INSERT INTO users (name,userId,email,password,phoneNo,role)
        OUTPUT INSERTED.*
        VALUES(@name, @userId, @email, @password, @phoneNo,'DOCTOR')
        `);

    const doctors = await pool
      .request()
      .input("name", sql.VarChar, name)
      .input("email", sql.VarChar, email)
      .input("doctorId", sql.VarChar, userId)
      .input("specialization", sql.VarChar, specialization)
      .input("experience", sql.Int, experience)
      .input("qualification", sql.VarChar, qualification)
      .input("phoneNo", sql.VarChar, phoneNo).query(`
            INSERT INTO doctors (name,email,doctorId,specialization,experience,qualification,phoneNo)
            OUTPUT INSERTED.*
            VALUES (@name,@email,@doctorId,@specialization,@experience,@qualification,@phoneNo)
            `);

    await SendEmail({
      to: email,
      subject: "Your Doctor Account Details",
      html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #2E86C1;">Welcome to Platform!</h2>
      <p>Your account as a doctor has been created successfully.</p>
      <p>Here are your login credentials:</p>
      <ul style="font-size: 18px; font-weight: bold; color: #D35400;">
        <li>Doctor ID: ${userId}</li>
        <li>Password: ${password}</li>
      </ul>
      <p>Please <strong>change this password after logging in</strong> for security.</p>
      <br />
      <p style="font-size: 14px; color: #7F8C8D;">
        If you did not expect this email, please contact the admin immediately.
      </p>
    </div>
            `,
    });

    return res.status(201).json({
        message:"Doctor Created Successfully",
        users : users.recordset[0],
        doctor : doctors.recordset[0],
        // plainPassword : password
    })
  } catch (error) {
    return res.status(500).json({message:"Something went wrong"})
  }
};

export const getAllPendingAppointmentscontroller = async(req,res)=>{
    try {
        if(req.user.role !== "Admin"){
            return res.status(401).json({message:"Only admin can access this"})
        }

        const pool = await getPool();

        const result = await pool.request()
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
            p.name AS p_name,
            p.email AS p_email,
            p.phoneNo AS p_phoneNo,
            p.gender AS p_gender,
            p.age AS p_age,

            -- Doctor Professional Info (doctors)
           
            d.specialization AS d_specialization,
            d.experience AS d_experience,
            d.qualification AS d_qualification,

            -- Doctor Personal Info (users)
            du.name AS d_name,
            du.email AS d_email,
            du.phoneNo AS d_phoneNo,
            du.gender AS d_gender,
            du.age AS d_age

            FROM appointments a
            INNER JOIN users p ON a.patientId = p.userId
            INNER JOIN doctors d ON a.doctorId = d.doctorId
            INNER JOIN users du ON d.doctorId = du.userId
            WHERE a.status = 'PENDING'
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
                  patientId:row.patientId,
                    name : row.p_name,
                    email : row.p_email,
                    phoneNo : row.p_phoneNo,
                    gender : row.p_gender,
                    age : row.p_age,
                },
                doctor:{
                  doctorId:row.doctorId,
                    name:row.d_name,
                    email:row.d_email,
                    phoneNo:row.d_phoneNo,
                    gender:row.d_gender,
                    age:row.d_age,
                    specialization:row.d_specialization,
                    experience:row.d_experience,
                    qualification:row.d_qualification,
                }
            }))

            return res.status(200).json({
                message:"All Pending Appointments fetched successfully",
                appointments : formattedAppointments
            })
    } catch (error) {
         return res.status(500).json({message:"Something went wrong"})
    }
}

export const getAllRejectedAppointmentscontroller = async(req,res)=>{
    try {
        if(req.user.role !== "Admin"){
            return res.status(401).json({message:"Only admin can access this"})
        }

        const pool = await getPool();

        const result = await pool.request()
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
            p.name AS p_name,
            p.email AS p_email,
            p.phoneNo AS p_phoneNo,
            p.gender AS p_gender,
            p.age AS p_age,

            -- Doctor Professional Info (doctors)
           
            d.specialization AS d_specialization,
            d.experience AS d_experience,
            d.qualification AS d_qualification,

            -- Doctor Personal Info (users)
            du.name AS d_name,
            du.email AS d_email,
            du.phoneNo AS d_phoneNo,
            du.gender AS d_gender,
            du.age AS d_age

            FROM appointments a
            INNER JOIN users p ON a.patientId = p.userId
            INNER JOIN doctors d ON a.doctorId = d.doctorId
            INNER JOIN users du ON d.doctorId = du.userId
            WHERE a.status = 'REJECTED'
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
                  patientId:row.patientId,
                    name : row.p_name,
                    email : row.p_email,
                    phoneNo : row.p_phoneNo,
                    gender : row.p_gender,
                    age : row.p_age,
                },
                doctor:{
                  doctorId:row.doctorId,
                    name:row.d_name,
                    email:row.d_email,
                    phoneNo:row.d_phoneNo,
                    gender:row.d_gender,
                    age:row.d_age,
                    specialization:row.d_specialization,
                    experience:row.d_experience,
                    qualification:row.d_qualification,
                }
            }))

            return res.status(200).json({
                message:"All Rejected Appointments fetched successfully",
                appointments : formattedAppointments
            })
    } catch (error) {
         return res.status(500).json({message:"Something went wrong"})
    }
}

export const getAllBookedAppointmentscontroller = async(req,res)=>{
    try {
        if(req.user.role !== "Admin"){
            return res.status(401).json({message:"Only admin can access this"})
        }

        const pool = await getPool();

        const result = await pool.request()
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
            p.name AS p_name,
            p.email AS p_email,
            p.phoneNo AS p_phoneNo,
            p.gender AS p_gender,
            p.age AS p_age,

            -- Doctor Professional Info (doctors)
           
            d.specialization AS d_specialization,
            d.experience AS d_experience,
            d.qualification AS d_qualification,

            -- Doctor Personal Info (users)
            du.name AS d_name,
            du.email AS d_email,
            du.phoneNo AS d_phoneNo,
            du.gender AS d_gender,
            du.age AS d_age

            FROM appointments a
            INNER JOIN users p ON a.patientId = p.userId
            INNER JOIN doctors d ON a.doctorId = d.doctorId
            INNER JOIN users du ON d.doctorId = du.userId
            WHERE a.status = 'BOOKED'
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
                  patientId:row.patientId,
                    name : row.p_name,
                    email : row.p_email,
                    phoneNo : row.p_phoneNo,
                    gender : row.p_gender,
                    age : row.p_age,
                },
                doctor:{
                  doctorId:row.doctorId,
                    name:row.d_name,
                    email:row.d_email,
                    phoneNo:row.d_phoneNo,
                    gender:row.d_gender,
                    age:row.d_age,
                    specialization:row.d_specialization,
                    experience:row.d_experience,
                    qualification:row.d_qualification,
                }
            }))

            return res.status(200).json({
                message:"All Booked Appointments fetched successfully",
                appointments : formattedAppointments
            })
    } catch (error) {
         return res.status(500).json({message:"Something went wrong"})
    }
}

export const getAllPatients = async(req,res)=>{
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT * FROM users WHERE role='PATIENT'
      ORDER BY createdAt DESC
      `)

      return res.status(200).json({
        message:"All Patients Fetched Successfully",
        patients : result.recordset
      })
  } catch (error) {
    return res.status(500).json({message:"Error fetching Patients"})
  }
}

export const getAllDoctors = async(req,res)=>{
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
       d.id,
       d.name,
       d.email,
       d.phoneNo,
       d.specialization,
       d.experience,
       d.qualification,
       d.doctorId,
       u.gender,
       u.age,
       u.role,
       u.createdAt

       FROM doctors d
       INNER JOIN users u ON d.doctorId = u.userId
       ORDER BY d.createdAt DESC
      `)

      return res.status(200).json({
        message:"All Doctors Fetched Successfully",
        doctors : result.recordset
      })
  } catch (error) {
    return res.status(500).json({message:"Error fetching Doctors"})
  }
}

export const getAllCountsController = async(req,res)=>{
  try {
    const pool = await getPool();

    const [pending,booked,rejected,doctors,patients] = await Promise.all([
      pool.request().query("SELECT COUNT(*) AS count FROM appointments WHERE status='PENDING'"),
      pool.request().query("SELECT COUNT(*) AS count FROM appointments WHERE status='BOOKED'"),
      pool.request().query("SELECT COUNT(*) AS count FROM appointments WHERE status='REJECTED'"),
      pool.request().query("SELECT COUNT(*) AS count FROM users WHERE role='DOCTOR'"),
      pool.request().query("SELECT COUNT(*) AS count FROM users WHERE role='PATIENT'")
    ])

    return res.status(200).json({
      message:"Dashboard counts fetched successfully",
      data:{
        pendingAppointments : pending.recordset[0].count,
        bookedAppointments : booked.recordset[0].count,
        rejectedAppointments : rejected.recordset[0].count,
        totalDoctors : doctors.recordset[0].count,
        totalPatients : patients.recordset[0].count
      }
    })
  } catch (error) {
    return res.status(500).json({message:"Error fetching Counts"})
  }
}
