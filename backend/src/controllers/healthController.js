const db = require('../config/db');

exports.create = async (req, res) => {
  try {
    const { child_id, record_type, description, diagnosis, treatment, doctor_name, visit_date, next_visit, medications } = req.body;
    const result = await db.query(
      `INSERT INTO health_records (child_id, record_type, description, diagnosis, treatment, doctor_name, visit_date, next_visit, medications, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [child_id, record_type, description || null, diagnosis || null, treatment || null, doctor_name || null, visit_date || null, next_visit || null, medications || null, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getByChild = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM health_records WHERE child_id = $1 ORDER BY visit_date DESC', [req.params.child_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.addVaccination = async (req, res) => {
  try {
    const { child_id, vaccine_name, date_given, next_due, given_by, notes } = req.body;
    const result = await db.query(
      `INSERT INTO vaccinations (child_id, vaccine_name, date_given, next_due, given_by, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [child_id, vaccine_name, date_given || null, next_due || null, given_by || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
