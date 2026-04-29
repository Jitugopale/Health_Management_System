import { hashSync } from "bcrypt";
import { getPool } from "../db/db.js";
import { SendEmail } from "../services/gmail.js";

const generateDoctorUserId = async (pool) => {
  const result = await pool.query(`
    SELECT "userId" FROM users
    WHERE role = 'DOCTOR' AND "userId" LIKE 'DOC%'
    ORDER BY id DESC LIMIT 1`);

  if (result.rows.length === 0) return "DOC001";

  const lastId = result.rows[0].userId;
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

    const { name, email, specialization, experience, qualification, phoneNo } = req.body;

    if (!name || !email || !specialization || !experience || !qualification || !phoneNo) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const pool = await getPool();

    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`, [email]
    );

    if (result.rows.length > 0) {
      return res.status(404).json({ message: "Doctor already exists with this email" });
    }

    const userId = await generateDoctorUserId(pool);
    const password = generateRandomPassword();
    const hashPassword = hashSync(password, 10);

    const users = await pool.query(
      `INSERT INTO users (name, "userId", email, password, "phoneNo", role)
       VALUES ($1, $2, $3, $4, $5, 'DOCTOR')
       RETURNING *`,
      [name, userId, email, hashPassword, phoneNo]
    );

    const doctors = await pool.query(
      `INSERT INTO doctors (name, email, "doctorId", specialization, experience, qualification, "phoneNo")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, email, userId, specialization, experience, qualification, phoneNo]
    );

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
      message: "Doctor Created Successfully",
      users: users.rows[0],
      doctor: doctors.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const appointmentJoinQuery = (status) => `
  SELECT
    a.id, a."appointmentId", a.date, a.time, a.status, a.notes,
    a."patientId", a."doctorId", a."createdAt",
    p.name AS p_name, p.email AS p_email,
    p."phoneNo" AS p_phoneno, p.gender AS p_gender, p.age AS p_age,
    d.specialization AS d_specialization, d.experience AS d_experience,
    d.qualification AS d_qualification,
    du.name AS d_name, du.email AS d_email,
    du."phoneNo" AS d_phoneno, du.gender AS d_gender, du.age AS d_age
  FROM appointments a
  INNER JOIN users p ON a."patientId" = p."userId"
  INNER JOIN doctors d ON a."doctorId" = d."doctorId"
  INNER JOIN users du ON d."doctorId" = du."userId"
  WHERE a.status = '${status}'
  ORDER BY a."createdAt" DESC
`;

const formatAppointments = (rows) =>
  rows.map((row) => ({
    id: row.id,
    appointmentId: row.appointmentId,
    date: row.date,
    time: row.time,
    status: row.status,
    notes: row.notes,
    createdAt: row.createdAt,
    patient: {
      patientId: row.patientId,
      name: row.p_name,
      email: row.p_email,
      phoneNo: row.p_phoneno,
      gender: row.p_gender,
      age: row.p_age,
    },
    doctor: {
      doctorId: row.doctorId,
      name: row.d_name,
      email: row.d_email,
      phoneNo: row.d_phoneno,
      gender: row.d_gender,
      age: row.d_age,
      specialization: row.d_specialization,
      experience: row.d_experience,
      qualification: row.d_qualification,
    },
  }));

export const getAllPendingAppointmentscontroller = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(401).json({ message: "Only admin can access this" });
    }
    const pool = await getPool();
    const result = await pool.query(appointmentJoinQuery("PENDING"));
    return res.status(200).json({
      message: "All Pending Appointments fetched successfully",
      appointments: formatAppointments(result.rows),
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllRejectedAppointmentscontroller = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(401).json({ message: "Only admin can access this" });
    }
    const pool = await getPool();
    const result = await pool.query(appointmentJoinQuery("REJECTED"));
    return res.status(200).json({
      message: "All Rejected Appointments fetched successfully",
      appointments: formatAppointments(result.rows),
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllBookedAppointmentscontroller = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(401).json({ message: "Only admin can access this" });
    }
    const pool = await getPool();
    const result = await pool.query(appointmentJoinQuery("BOOKED"));
    return res.status(200).json({
      message: "All Booked Appointments fetched successfully",
      appointments: formatAppointments(result.rows),
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllPatients = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.query(
      `SELECT * FROM users WHERE role = 'PATIENT' ORDER BY "createdAt" DESC`
    );
    return res.status(200).json({
      message: "All Patients Fetched Successfully",
      patients: result.rows,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Patients" });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.query(`
      SELECT d.id, d.name, d.email, d."phoneNo", d.specialization,
             d.experience, d.qualification, d."doctorId",
             u.gender, u.age, u.role, u."createdAt"
      FROM doctors d
      INNER JOIN users u ON d."doctorId" = u."userId"
      ORDER BY d."createdAt" DESC
    `);
    return res.status(200).json({
      message: "All Doctors Fetched Successfully",
      doctors: result.rows,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Doctors" });
  }
};

export const getAllCountsController = async (req, res) => {
  try {
    const pool = await getPool();
    const [pending, booked, rejected, doctors, patients] = await Promise.all([
      pool.query("SELECT COUNT(*) AS count FROM appointments WHERE status='PENDING'"),
      pool.query("SELECT COUNT(*) AS count FROM appointments WHERE status='BOOKED'"),
      pool.query("SELECT COUNT(*) AS count FROM appointments WHERE status='REJECTED'"),
      pool.query("SELECT COUNT(*) AS count FROM users WHERE role='DOCTOR'"),
      pool.query("SELECT COUNT(*) AS count FROM users WHERE role='PATIENT'"),
    ]);
    return res.status(200).json({
      message: "Dashboard counts fetched successfully",
      data: {
        pendingAppointments: parseInt(pending.rows[0].count),
        bookedAppointments: parseInt(booked.rows[0].count),
        rejectedAppointments: parseInt(rejected.rows[0].count),
        totalDoctors: parseInt(doctors.rows[0].count),
        totalPatients: parseInt(patients.rows[0].count),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Counts" });
  }
};
