const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;
    let q = `SELECT d.*, u.name as recorded_by_name FROM donations d LEFT JOIN users u ON d.recorded_by = u.id WHERE 1=1`;
    const params = [];
    if (type) { params.push(type); q += ` AND donation_type = $${params.length}`; }
    q += ` ORDER BY d.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const result = await db.query(q, params);
    const total = await db.query('SELECT SUM(amount) as total, COUNT(*) as count FROM donations WHERE donation_type = \'cash\'');
    res.json({ donations: result.rows, summary: total.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { donor_name, donor_email, donor_phone, amount, donation_type, item_description, payment_method, mpesa_ref, notes } = req.body;
    const receipt_no = `RCP-${Date.now()}`;
    const result = await db.query(
      `INSERT INTO donations (donor_name, donor_email, donor_phone, amount, donation_type, item_description, payment_method, mpesa_ref, receipt_no, notes, recorded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [donor_name, donor_email, donor_phone, amount, donation_type, item_description, payment_method, mpesa_ref, receipt_no, notes, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const monthly = await db.query(`
      SELECT DATE_TRUNC('month', created_at) as month, SUM(amount) as total, COUNT(*) as count
      FROM donations WHERE donation_type = 'cash'
      GROUP BY month ORDER BY month DESC LIMIT 12
    `);
    const byType = await db.query(`SELECT donation_type, COUNT(*), SUM(amount) FROM donations GROUP BY donation_type`);
    res.json({ monthly: monthly.rows, by_type: byType.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
