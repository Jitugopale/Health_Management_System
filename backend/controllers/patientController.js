import { getPool } from "../db/db.js";
import { handleHealthQuery } from "../services/healthAgent.js";

const generateAppointmentId = async (pool) => {
  const result = await pool.query(`
    SELECT "appointmentId" FROM appointments
    WHERE "appointmentId" LIKE 'APP%'
    ORDER BY id DESC LIMIT 1`);

  if (result.rows.length === 0) return "APP001";

  const lastId = result.rows[0].appointmentId;
  const numericPart = parseInt(lastId.slice(3));
  const newNumericPart = (numericPart + 1).toString().padStart(3, "0");
  return `APP${newNumericPart}`;
};

export const getAllDoctorsController = async (req, res) => {
  try {
    if (req.user.role !== "PATIENT" && req.user.role !== "Admin") {
      return res.status(401).json({ message: "Only patients or admins can access this feature" });
    }

    const pool = await getPool();

    const doctors = await pool.query(
      `SELECT "doctorId", name, specialization, qualification, email, "phoneNo" FROM doctors`
    );

    if (doctors.rows.length === 0) {
      return res.status(404).json({ message: "No Doctors Found" });
    }

    return res.status(200).json({
      message: "Doctors Fetched Successfully",
      data: doctors.rows,
    });
  } catch (error) {
    console.error("Error Fetching doctors", error);
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

export const requestAppointmentController = async (req, res) => {
  try {
    const role = req.user.role;
    const patientUserId = req.user.id;

    if (role !== "PATIENT") {
      return res.status(401).json({ message: "Only patients can request appointment" });
    }

    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({ message: "Doctor Id is required" });
    }

    const pool = await getPool();

    const doctorResult = await pool.query(
      `SELECT "doctorId" FROM doctors WHERE "doctorId" = $1`, [doctorId]
    );

    if (doctorResult.rows.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const appointmentId = await generateAppointmentId(pool);

    const insertResult = await pool.query(
      `INSERT INTO appointments ("appointmentId", status, "patientId", "doctorId")
       VALUES ($1, 'PENDING', $2, $3)
       RETURNING id, "appointmentId", date, time, status, notes, "patientId", "doctorId", "createdAt"`,
      [appointmentId, patientUserId, doctorId]
    );

    return res.status(201).json({
      message: "Appointment request created successfully",
      appointment: insertResult.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getMyAppointmentscontroller = async (req, res) => {
  try {
    if (req.user.role !== "PATIENT") {
      return res.status(401).json({ message: "Only patients can access this" });
    }

    const pool = await getPool();

    const result = await pool.query(
      `SELECT
        a.id, a."appointmentId", a.date, a.time, a.status, a.notes,
        a."patientId", a."doctorId", a."createdAt",
        p."userId" AS p_userid, p.name AS p_name, p.email AS p_email,
        p."phoneNo" AS p_phoneno, p.gender AS p_gender, p.age AS p_age,
        d."doctorId" AS d_doctorid, d.name AS d_name, d.email AS d_email,
        d."phoneNo" AS d_phoneno, d.specialization AS d_specialization,
        d.experience AS d_experience, d.qualification AS d_qualification
       FROM appointments a
       INNER JOIN users p ON a."patientId" = p."userId"
       INNER JOIN doctors d ON a."doctorId" = d."doctorId"
       WHERE a."patientId" = $1
       ORDER BY a."createdAt" DESC`,
      [req.user.id]
    );

    const formattedAppointments = result.rows.map((row) => ({
      id: row.id,
      appointmentId: row.appointmentId,
      date: row.date,
      time: row.time,
      status: row.status,
      notes: row.notes,
      createdAt: row.createdAt,
      patient: {
        userId: row.p_userid,
        name: row.p_name,
        email: row.p_email,
        phoneNo: row.p_phoneno,
        gender: row.p_gender,
        age: row.p_age,
      },
      doctor: {
        userId: row.d_doctorid,
        name: row.d_name,
        email: row.d_email,
        phoneNo: row.d_phoneno,
        specialization: row.d_specialization,
        experience: row.d_experience,
        qualification: row.d_qualification,
      },
    }));

    return res.status(200).json({
      message: "Appointments fetched successfully",
      appointments: formattedAppointments,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const chatAgentController = async (req, res) => {
  if (req.user.role !== "PATIENT") {
    return res.status(401).json({ message: "Only patients can access this" });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }

  try {
    const result = await handleHealthQuery(message);
    return res.status(200).json({
      reply: result.answer,
      source: result.source,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
