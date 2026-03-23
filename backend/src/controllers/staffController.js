const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getAll = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT s.*, u.email, u.last_login, u.is_active as user_active
      FROM staff s LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, role, phone, email, id_number, employment_date, shift, password } = req.body;

    let userId = null;
    if (email && password) {
      const hash = await bcrypt.hash(password, 12);
      const validUserRoles = ['admin', 'manager', 'caregiver', 'nurse'];
      const userRole = validUserRoles.includes(role) ? role : 'caregiver';
      const userResult = await db.query(
        `INSERT INTO users (name, email, password_hash, role, phone)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, password_hash=EXCLUDED.password_hash
         RETURNING id`,
        [name, email, hash, userRole, phone || null]
      );
      userId = userResult.rows[0].id;
    }

    const result = await db.query(
      `INSERT INTO staff (user_id, name, role, phone, email, id_number, employment_date, shift)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [userId, name, role, phone || null, email || null, id_number || null, employment_date || null, shift || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, phone, shift, is_active } = req.body;
    const result = await db.query(
      `UPDATE staff SET name=$1, role=$2, phone=$3, shift=$4, is_active=$5 WHERE id=$6 RETURNING *`,
      [name, role, phone, shift, is_active, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { staff_id, status, check_in, check_out, notes } = req.body;
    const existing = await db.query('SELECT id FROM staff_attendance WHERE staff_id=$1 AND date=CURRENT_DATE', [staff_id]);
    let result;
    if (existing.rows[0]) {
      result = await db.query(
        `UPDATE staff_attendance SET status=$1, check_in=$2, check_out=$3, notes=$4 WHERE id=$5 RETURNING *`,
        [status, check_in, check_out, notes, existing.rows[0].id]
      );
    } else {
      result = await db.query(
        `INSERT INTO staff_attendance (staff_id, status, check_in, check_out, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [staff_id, status, check_in, check_out, notes]
      );
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    const result = await db.query(
      `SELECT sa.*, s.name, s.role FROM staff_attendance sa JOIN staff s ON sa.staff_id = s.id WHERE sa.date = $1`,
      [date || new Date().toISOString().split('T')[0]]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
