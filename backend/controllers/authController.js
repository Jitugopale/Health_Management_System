import { getPool } from "../db/db.js";
import { compareSync, hashSync } from "bcrypt";
import { SendEmail } from "../services/gmail.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

const generatePatientUserId = async (pool) => {
  const result = await pool.query(`
    SELECT "userId" FROM users
    WHERE role = 'PATIENT' AND "userId" LIKE 'PAT%'
    ORDER BY id DESC LIMIT 1`);

  if (result.rows.length === 0) return "PAT001";

  const lastId = result.rows[0].userId;
  const numericPart = parseInt(lastId.slice(3));
  const newNumericPart = (numericPart + 1).toString().padStart(3, "0");
  return `PAT${newNumericPart}`;
};

export const RegisterPatientController = async (req, res) => {
  try {
    const { name, email, password, phoneNo, gender, age } = req.body;

    if (!name || !email || !password || !phoneNo || !gender || !age) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (phoneNo.length !== 10) {
      return res.status(400).json({ message: "Phone no must be 10 digits" });
    }

    const pool = await getPool();

    const existingUser = await pool.query(
      `SELECT * FROM users WHERE email = $1`, [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: "User Already exists",
        existingUser: existingUser.rows[0],
      });
    }

    const userId = await generatePatientUserId(pool);
    const hashPassword = hashSync(password, 10);

    await SendEmail({
      to: email,
      subject: "Your Patient Account Credentials",
      html: `
             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #2E86C1;">Welcome to Platform!</h2>
          <p>Your account as a patient has been created successfully.</p>
          <p>Here are your login credentials:</p>
          <ul style="font-size: 18px; font-weight: bold; color: #D35400;">
            <li>Patient ID: ${userId} </li>
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

    const result = await pool.query(
      `INSERT INTO users (name, "userId", email, password, "phoneNo", gender, age)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, userId, email, hashPassword, phoneNo, gender, age]
    );

    return res.status(201).json({
      message: "Patient registered Successfully",
      user: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

export const LoginController = async (req, res) => {
  const { userId, password } = req.body;

  if (!userId || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (userId === process.env.ADMIN_ID && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign(
      { userId: process.env.ADMIN_ID, role: "Admin" },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    return res.status(200).json({
      message: "Admin Login Successfully",
      token,
      user: { adminId: userId, role: "Admin" },
    });
  } else {
    try {
      const pool = await getPool();

      const result = await pool.query(
        `SELECT * FROM users WHERE "userId" = $1`, [userId]
      );

      const user = result.rows[0];

      if (!user) {
        return res.status(404).json({ message: "User not Found" });
      }

      const comparePassword = compareSync(password, user.password);

      if (!comparePassword) {
        return res.status(400).json({ message: "Invalid Password" });
      }

      const token = jwt.sign({ id: user.userId, role: user.role }, JWT_SECRET, {
        expiresIn: "1d",
      });

      return res.status(200).json({
        message: "Login Successful",
        token,
        user,
      });
    } catch (error) {
      return res.status(500).json({ message: "Something Went Wrong" });
    }
  }
};

export const getUserController = async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = await getPool();

    const result = await pool.query(
      `SELECT * FROM users WHERE "userId" = $1`, [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "User fetched Successfully",
      user: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

export const UpdateUserController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phoneNo, gender, age } = req.body;

    if (!name || !email || !phoneNo || !gender || !age) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const pool = await getPool();

    const checkUser = await pool.query(
      `SELECT * FROM users WHERE "userId" = $1`, [userId]
    );

    if (checkUser.rows.length === 0) {
      return res.status(404).json({ message: "User not Found" });
    }

    const updatedUser = await pool.query(
      `UPDATE users
       SET name = $1, email = $2, "phoneNo" = $3, gender = $4, age = $5
       WHERE "userId" = $6
       RETURNING *`,
      [name, email, phoneNo, gender, age, userId]
    );

    return res.status(200).json({
      message: "User Updated Successfully",
      user: updatedUser.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

export const UpdatePasswordController = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New Password is required" });
    }

    const userId = req.user.id;
    const role = req.user.role;

    if (role !== "PATIENT" && role !== "DOCTOR") {
      return res.status(401).json({ message: "not unauthorized" });
    }

    const pool = await getPool();

    const userResult = await pool.query(
      `SELECT email FROM users WHERE "userId" = $1`, [userId]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const email = user.email;
    const hashPassword = hashSync(newPassword, 10);

    await SendEmail({
      to: email,
      subject: `Your ${role} Account Credentials`,
      html: `
             <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #2E86C1;">Account Updated Successfully</h2>
          <p>Your account as a ${role.toLowerCase()} has been updated.</p>
          <p>Here are your login credentials:</p>
          <ul style="font-size: 18px; font-weight: bold; color: #D35400;">
            <li>User ID: ${userId}</li>
            <li>New Password: ${newPassword}</li>
          </ul>
          <br />
          <p style="font-size: 14px; color: #7F8C8D;">
            If you did not expect this email, please contact the admin immediately.
          </p>
        </div>
            `,
    });

    const updateResult = await pool.query(
      `UPDATE users SET password = $1 WHERE "userId" = $2
       RETURNING "userId", name, email, role, "phoneNo", gender, age`,
      [hashPassword, userId]
    );

    return res.status(200).json({
      message: "Password Updated Successfully",
      user: updateResult.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

export const sendMessageController = async (req, res) => {
  try {
    const { appointmentId, receiverId, message } = req.body;

    if (!appointmentId || !receiverId || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const pool = await getPool();

    const appointmentCheck = await pool.query(
      `SELECT status FROM appointments WHERE "appointmentId" = $1`, [appointmentId]
    );

    if (appointmentCheck.rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const status = appointmentCheck.rows[0].status;

    if (status !== "BOOKED") {
      return res.status(403).json({ message: "You can only send messages for booked appointments" });
    }

    const result = await pool.query(
      `INSERT INTO chats ("appointmentId", "senderId", "receiverId", message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [appointmentId, req.user.id, receiverId, message]
    );

    return res.status(201).json({
      message: "Message Sent Successfully",
      chat: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};

export const getChatHistoryController = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    if (!appointmentId) {
      return res.status(400).json({ message: "appointmentId is required" });
    }

    const pool = await getPool();

    const result = await pool.query(
      `SELECT * FROM chats WHERE "appointmentId" = $1 ORDER BY "createdAt" ASC`,
      [appointmentId]
    );

    return res.status(201).json({
      message: "Chat history fetched Successfully",
      chat: result.rows,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something Went Wrong" });
  }
};
