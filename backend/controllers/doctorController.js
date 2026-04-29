import { getPool } from "../db/db.js";

export const updateDoctorInfoController = async (req, res) => {
  try {
    if (req.user.role !== "DOCTOR") {
      return res.status(401).json({ message: "Only doctors can update their profile" });
    }

    const doctorId = req.user.id;
    const { name, email, specialization, experience, qualification, phoneNo } = req.body;

    const pool = await getPool();

    const checkDoctor = await pool.query(
      `SELECT * FROM doctors WHERE "doctorId" = $1`, [doctorId]
    );

    if (checkDoctor.rows.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const updateDoctor = await pool.query(
      `UPDATE doctors
       SET name = $1, email = $2, specialization = $3,
           experience = $4, qualification = $5, "phoneNo" = $6
       WHERE "doctorId" = $7
       RETURNING *`,
      [name, email, specialization, experience, qualification, phoneNo, doctorId]
    );

    return res.status(200).json({
      message: "Doctor info updated successfully",
      doctor: updateDoctor.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getDoctorInfoController = async (req, res) => {
  try {
    if (req.user.role !== "DOCTOR") {
      return res.status(401).json({ message: "Only doctors can view their profile" });
    }

    const doctorId = req.user.id;
    const pool = await getPool();

    const result = await pool.query(
      `SELECT id, name, email, "phoneNo", specialization, experience, qualification, "doctorId", "createdAt"
       FROM doctors WHERE "doctorId" = $1`,
      [doctorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    return res.status(200).json({
      message: "Doctor info fetched successfully",
      doctor: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getPendingAppointmentscontroller = async (req, res) => {
  try {
    if (req.user.role !== "DOCTOR") {
      return res.status(401).json({ message: "Only doctors can access this" });
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
       WHERE a."doctorId" = $1 AND a.status = 'PENDING'
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
      message: "Pending Appointments fetched successfully",
      appointments: formattedAppointments,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const approveAppointmentController = async (req, res) => {
  try {
    if (req.user.role !== "DOCTOR") {
      return res.status(401).json({ message: "Only doctors can approve appointments" });
    }

    const { id } = req.params;
    const { date, time, notes } = req.body;

    const pool = await getPool();

    const result = await pool.query(
      `UPDATE appointments
       SET status = 'BOOKED', date = $1, time = $2, notes = $3
       WHERE "appointmentId" = $4
       RETURNING *`,
      [date, time, notes || null, id]
    );

    return res.status(200).json({
      message: "Appointment booked successfully",
      appointment: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const rejectAppointmentController = async (req, res) => {
  try {
    if (req.user.role !== "DOCTOR") {
      return res.status(401).json({ message: "Only doctors can reject appointments" });
    }

    const { id } = req.params;
    const pool = await getPool();

    const result = await pool.query(
      `UPDATE appointments
       SET status = 'REJECTED'
       WHERE "appointmentId" = $1
       RETURNING *`,
      [id]
    );

    return res.status(200).json({
      message: "Appointment rejected successfully",
      appointment: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getRejectedAppointmentscontroller = async (req, res) => {
  try {
    if (req.user.role !== "DOCTOR") {
      return res.status(401).json({ message: "Only doctors can access this" });
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
       WHERE a."doctorId" = $1 AND a.status = 'REJECTED'
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
      message: "Rejected Appointments fetched successfully",
      appointments: formattedAppointments,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getBookedAppointmentscontroller = async (req, res) => {
  try {
    if (req.user.role !== "DOCTOR") {
      return res.status(401).json({ message: "Only doctors can access this" });
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
       WHERE a."doctorId" = $1 AND a.status = 'BOOKED'
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
      message: "Booked Appointments fetched successfully",
      appointments: formattedAppointments,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllDoctorCountsController = async (req, res) => {
  try {
    if (req.user.role !== "DOCTOR") {
      return res.status(401).json({ message: "Only doctors can access this" });
    }

    const pool = await getPool();
    const doctorId = req.user.id;

    const [pending, booked, rejected] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS count FROM appointments WHERE "doctorId" = $1 AND status='PENDING'`, [doctorId]),
      pool.query(`SELECT COUNT(*) AS count FROM appointments WHERE "doctorId" = $1 AND status='BOOKED'`, [doctorId]),
      pool.query(`SELECT COUNT(*) AS count FROM appointments WHERE "doctorId" = $1 AND status='REJECTED'`, [doctorId]),
    ]);

    const totalAppointments =
      parseInt(pending.rows[0].count) +
      parseInt(booked.rows[0].count) +
      parseInt(rejected.rows[0].count);

    return res.status(200).json({
      message: "Dashboard counts fetched successfully",
      data: {
        pendingAppointments: parseInt(pending.rows[0].count),
        bookedAppointments: parseInt(booked.rows[0].count),
        rejectedAppointments: parseInt(rejected.rows[0].count),
        totalAppointments,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Counts" });
  }
};
