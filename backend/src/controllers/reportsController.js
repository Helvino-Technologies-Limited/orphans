const db = require('../config/db');

exports.childrenReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const result = await db.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM health_records WHERE child_id = c.id) as health_visits,
        (SELECT COUNT(*) FROM activities WHERE child_id = c.id) as total_activities
      FROM children c WHERE ($1::date IS NULL OR admission_date >= $1) AND ($2::date IS NULL OR admission_date <= $2)
      ORDER BY c.admission_date DESC
    `, [from || null, to || null]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.financialReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const donations = await db.query(
      `SELECT * FROM donations WHERE ($1::date IS NULL OR created_at::date >= $1) AND ($2::date IS NULL OR created_at::date <= $2) ORDER BY created_at DESC`,
      [from || null, to || null]
    );
    const expenses = await db.query(
      `SELECT * FROM expenses WHERE ($1::date IS NULL OR expense_date >= $1) AND ($2::date IS NULL OR expense_date <= $2) ORDER BY expense_date DESC`,
      [from || null, to || null]
    );
    const totalDonations = donations.rows.filter(d => d.donation_type === 'cash').reduce((s, d) => s + parseFloat(d.amount || 0), 0);
    const totalExpenses = expenses.rows.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
    res.json({ donations: donations.rows, expenses: expenses.rows, total_donations: totalDonations, total_expenses: totalExpenses, balance: totalDonations - totalExpenses });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.auditReport = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT al.*, u.name as user_name FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC LIMIT 100
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
