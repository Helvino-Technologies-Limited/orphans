const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT i.*, c.full_name as child_name, u.name as reported_by_name
      FROM incidents i LEFT JOIN children c ON i.child_id=c.id LEFT JOIN users u ON i.reported_by=u.id
      ORDER BY i.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, incident_type, severity, child_id } = req.body;
    const result = await db.query(
      `INSERT INTO incidents (title, description, incident_type, severity, child_id, reported_by) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [title, description, incident_type, severity, child_id || null, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.resolve = async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE incidents SET status='resolved', resolved_at=NOW() WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
