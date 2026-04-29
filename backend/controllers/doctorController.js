import { getPool, sql } from "../db/db.js";

export const updateDoctorInfoController = async (req, res) => {
  try {
    if (req.user.role !== "DOCTOR") {
      return res
        .status(401)
        .json({ message: "Only doctors can update their profile" });
    }

    const doctorId = req.user.id;
    const { name, email, specialization, experience, qualification, phoneNo } =
      req.body;

    const pool = await getPool();

    const checkDoctor = await pool

      .request()
      .input("doctorId", sql.VarChar, doctorId)
      .query(`SELECT * FROM doctors WHERE doctorId = @doctorId`);

    if (checkDoctor.recordset.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const updateDoctor = await pool
      .request()
      .input("doctorId", sql.VarChar, doctorId)
      .input("name", sql.VarChar, name)
      .input("email", sql.VarChar, email)
      .input("specialization", sql.VarChar, specialization)
      .input("experience", sql.Int, experience)
      .input("qualification", sql.VarChar, qualification)
      .input("phoneNo", sql.VarChar, phoneNo).query(`
        UPDATE doctors
        SET name = @name,
        email=@email,
        specialization=@specialization,
        experience=@experience,
        qualification=@qualification,
        phoneNo=@phoneNo

        WHERE doctorId = @doctorId;

        SELECT * FROM doctors WHERE doctorId=@doctorId
        `);

    return res.status(200).json({
      message: "Doctor info updated successfully",
      doctor: updateDoctor.recordset[0],
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const getDoctorInfoController = async (req, res) => {
  try {
    if (req.user.role !== "DOCTOR") {
      return res
        .status(401)
        .json({ message: "Only doctors can view their profile" });
    }

    const doctorId = req.user.id;

    const pool = await getPool();

    const result = await pool

      .request()
      .input("doctorId", sql.VarChar, doctorId)
      .query(
        `SELECT id, name, email, phoneNo, specialization, experience, qualification, doctorId,createdAt FROM doctors WHERE doctorId = @doctorId`,
      );

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    return res.status(200).json({
      message: "Doctor info fetched successfully",
      doctor: result.recordset[0],
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

    const result = await pool
      .request()
      .input("doctorId", sql.VarChar, req.user.id).query(`
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
            WHERE a.doctorId = @doctorId AND status = 'PENDING'
            ORDER BY a.createdAt DESC
            `);

    const formattedAppointments = result.recordset.map((row) => ({
      id: row.id,
      appointmentId: row.appointmentId,
      date: row.date,
      time: row.time,
      status: row.status,
      notes: row.notes,
      createdAt: row.createdAt,

      patient: {
        userId: row.p_userId,
        name: row.p_name,
        email: row.p_email,
        phoneNo: row.p_phoneNo,
        gender: row.p_gender,
        age: row.p_age,
      },
      doctor: {
        userId: row.d_doctorId,
        name: row.d_name,
        email: row.d_email,
        phoneNo: row.d_phoneNo,
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
      return res
        .status(401)
        .json({ message: "Only doctors can approve appointments" });
    }

    const { id } = req.params;
    const { date, time, notes } = req.body;

    const pool = await getPool();

    const result = await pool
      .request()
      .input("appointmentId", sql.VarChar, id)
      .input("status", sql.VarChar, "BOOKED")
      .input("date", sql.VarChar, date)
      .input("time", sql.VarChar, time)
      .input("notes", sql.VarChar, notes || null).query(`
      UPDATE appointments
      SET status = @status, date = @date, time = @time, notes = @notes WHERE appointmentId = @appointmentId;

      SELECT * FROM appointments WHERE appointmentId = @appointmentId;
      `);

    return res.status(200).json({
      message: "Appointment booked successfully",
      appointment: result.recordset[0],
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const rejectAppointmentController = async (req, res) => {
  try {
    if (req.user.role !== "DOCTOR") {
      return res
        .status(401)
        .json({ message: "Only doctors can approve appointments" });
    }

    const { id } = req.params;

    const pool = await getPool();

    const result = await pool
      .request()
      .input("appointmentId", sql.VarChar, id)
      .input("status", sql.VarChar, "REJECTED").query(`
      UPDATE appointments
      SET status = @status WHERE appointmentId = @appointmentId;

      SELECT * FROM appointments WHERE appointmentId = @appointmentId;
      `);

    return res.status(200).json({
      message: "Appointment rejected successfully",
      appointment: result.recordset[0],
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

    const result = await pool
      .request()
      .input("doctorId", sql.VarChar, req.user.id).query(`
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
            WHERE a.doctorId = @doctorId AND status = 'REJECTED'
            ORDER BY a.createdAt DESC
            `);

    const formattedAppointments = result.recordset.map((row) => ({
      id: row.id,
      appointmentId: row.appointmentId,
      date: row.date,
      time: row.time,
      status: row.status,
      notes: row.notes,
      createdAt: row.createdAt,

      patient: {
        userId: row.p_userId,
        name: row.p_name,
        email: row.p_email,
        phoneNo: row.p_phoneNo,
        gender: row.p_gender,
        age: row.p_age,
      },
      doctor: {
        userId: row.d_doctorId,
        name: row.d_name,
        email: row.d_email,
        phoneNo: row.d_phoneNo,
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

    const result = await pool
      .request()
      .input("doctorId", sql.VarChar, req.user.id).query(`
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
            WHERE a.doctorId = @doctorId AND status = 'BOOKED'
            ORDER BY a.createdAt DESC
            `);

    const formattedAppointments = result.recordset.map((row) => ({
      id: row.id,
      appointmentId: row.appointmentId,
      date: row.date,
      time: row.time,
      status: row.status,
      notes: row.notes,
      createdAt: row.createdAt,

      patient: {
        userId: row.p_userId,
        name: row.p_name,
        email: row.p_email,
        phoneNo: row.p_phoneNo,
        gender: row.p_gender,
        age: row.p_age,
      },
      doctor: {
        userId: row.d_doctorId,
        name: row.d_name,
        email: row.d_email,
        phoneNo: row.d_phoneNo,
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
      pool
        .request()
        .input("doctorId", sql.VarChar, doctorId)
        .query(
          "SELECT COUNT(*) AS count FROM appointments WHERE doctorId = @doctorId AND status='PENDING'",
        ),
      pool
        .request()
        .input("doctorId", sql.VarChar, doctorId)
        .query(
          "SELECT COUNT(*) AS count FROM appointments WHERE doctorId = @doctorId AND status='BOOKED'",
        ),
      pool
        .request()
        .input("doctorId", sql.VarChar, doctorId)
        .query(
          "SELECT COUNT(*) AS count FROM appointments WHERE doctorId = @doctorId AND status='REJECTED'",
        ),
    ]);

    const totalAppointments =
      pending.recordset[0].count +
      booked.recordset[0].count +
      rejected.recordset[0].count;

    return res.status(200).json({
      message: "Dashboard counts fetched successfully",
      data: {
        pendingAppointments: pending.recordset[0].count,
        bookedAppointments: booked.recordset[0].count,
        rejectedAppointments: rejected.recordset[0].count,
        totalAppointments,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching Counts" });
  }
};
