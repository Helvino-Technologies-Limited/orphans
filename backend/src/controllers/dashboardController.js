const db = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const [children, staff, donations, expenses, inventory, incidents, recentActivities, admissions] = await Promise.all([
      db.query("SELECT COUNT(*) FROM children WHERE status='active'"),
      db.query("SELECT COUNT(*) FROM staff WHERE is_active=true"),
      db.query("SELECT COALESCE(SUM(amount),0) as total FROM donations WHERE DATE_TRUNC('month',created_at)=DATE_TRUNC('month',NOW())"),
      db.query("SELECT COALESCE(SUM(amount),0) as total FROM expenses WHERE DATE_TRUNC('month',expense_date)=DATE_TRUNC('month',NOW())"),
      db.query("SELECT COUNT(*) FROM inventory WHERE quantity <= minimum_stock"),
      db.query("SELECT COUNT(*) FROM incidents WHERE status='open'"),
      db.query(`SELECT a.*, c.full_name as child_name, u.name as recorded_by FROM activities a 
        JOIN children c ON a.child_id = c.id LEFT JOIN users u ON a.recorded_by = u.id 
        ORDER BY a.created_at DESC LIMIT 10`),
      db.query("SELECT COUNT(*) FROM children WHERE DATE_TRUNC('month',admission_date)=DATE_TRUNC('month',NOW())"),
    ]);

    const monthlyTrend = await db.query(`
      SELECT DATE_TRUNC('month', admission_date) as month, COUNT(*) 
      FROM children GROUP BY month ORDER BY month DESC LIMIT 6
    `);

    res.json({
      total_children: parseInt(children.rows[0].count),
      total_staff: parseInt(staff.rows[0].count),
      monthly_donations: parseFloat(donations.rows[0].total),
      monthly_expenses: parseFloat(expenses.rows[0].total),
      low_stock_alerts: parseInt(inventory.rows[0].count),
      open_incidents: parseInt(incidents.rows[0].count),
      new_admissions_this_month: parseInt(admissions.rows[0].count),
      recent_activities: recentActivities.rows,
      monthly_trend: monthlyTrend.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const lowStock = await db.query('SELECT item_name, quantity, minimum_stock, unit FROM inventory WHERE quantity <= minimum_stock');
    const incidents = await db.query("SELECT * FROM incidents WHERE status='open' ORDER BY created_at DESC LIMIT 5");
    const upcomingVaccinations = await db.query(`
      SELECT v.*, c.full_name FROM vaccinations v JOIN children c ON v.child_id = c.id
      WHERE v.next_due BETWEEN NOW() AND NOW() + INTERVAL '7 days'
    `);
    res.json({
      low_stock: lowStock.rows,
      open_incidents: incidents.rows,
      upcoming_vaccinations: upcomingVaccinations.rows,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
