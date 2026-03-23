const db = require('../config/db');

exports.create = async (req, res) => {
  try {
    const { child_id, activity_type, description, activity_date } = req.body;
    const result = await db.query(
      `INSERT INTO activities (child_id, activity_type, description, activity_date, recorded_by) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [child_id, activity_type, description, activity_date || new Date(), req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { child_id, date } = req.query;
    let q = `SELECT a.*, c.full_name as child_name, u.name as recorded_by_name FROM activities a JOIN children c ON a.child_id=c.id LEFT JOIN users u ON a.recorded_by=u.id WHERE 1=1`;
    const params = [];
    if (child_id) { params.push(child_id); q += ` AND a.child_id=$${params.length}`; }
    if (date) { params.push(date); q += ` AND a.activity_date=$${params.length}`; }
    q += ' ORDER BY a.created_at DESC LIMIT 50';
    const result = await db.query(q, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
