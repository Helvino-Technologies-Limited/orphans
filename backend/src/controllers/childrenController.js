const db = require('../config/db');
const { auditLog } = require('../middleware/logger');
const { v4: uuidv4 } = require('uuid');

exports.getAll = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let query = `SELECT * FROM children WHERE 1=1`;
    const params = [];

    if (status) { params.push(status); query += ` AND status = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (full_name ILIKE $${params.length} OR child_no ILIKE $${params.length})`; }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);
    const countResult = await db.query(`SELECT COUNT(*) FROM children WHERE 1=1${status ? ` AND status = '${status}'` : ''}`);

    res.json({ children: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const child = await db.query('SELECT * FROM children WHERE id = $1', [id]);
    if (!child.rows[0]) return res.status(404).json({ message: 'Child not found.' });

    const health = await db.query('SELECT * FROM health_records WHERE child_id = $1 ORDER BY visit_date DESC', [id]);
    const education = await db.query('SELECT * FROM education_records WHERE child_id = $1', [id]);
    const activities = await db.query('SELECT a.*, u.name as recorded_by_name FROM activities a LEFT JOIN users u ON a.recorded_by = u.id WHERE a.child_id = $1 ORDER BY a.created_at DESC LIMIT 10', [id]);
    const vaccinations = await db.query('SELECT * FROM vaccinations WHERE child_id = $1', [id]);
    const docs = await db.query('SELECT * FROM documents WHERE child_id = $1', [id]);

    res.json({ ...child.rows[0], health_records: health.rows, education_records: education.rows, activities: activities.rows, vaccinations: vaccinations.rows, documents: docs.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { full_name, gender, dob, estimated_age, background, guardian_name, guardian_contact, guardian_relationship, special_needs, admission_date } = req.body;

    const count = await db.query("SELECT COUNT(*) FROM children");
    const child_no = `CH-${String(parseInt(count.rows[0].count) + 1).padStart(4, '0')}`;

    const result = await db.query(
      `INSERT INTO children (child_no, full_name, gender, dob, estimated_age, background, guardian_name, guardian_contact, guardian_relationship, special_needs, admission_date, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [child_no, full_name, gender, dob || null, estimated_age ? parseInt(estimated_age) : null, background, guardian_name, guardian_contact, guardian_relationship, special_needs, admission_date || new Date(), req.user.id]
    );

    await auditLog(req.user.id, 'CREATE_CHILD', 'child', result.rows[0].id, { full_name }, req);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const keys = Object.keys(fields).filter(k => ['full_name','gender','dob','estimated_age','background','guardian_name','guardian_contact','guardian_relationship','special_needs','status'].includes(k));
    if (!keys.length) return res.status(400).json({ message: 'No valid fields.' });

    const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const values = keys.map(k => fields[k]);

    const result = await db.query(`UPDATE children SET ${sets}, updated_at = NOW() WHERE id = $1 RETURNING *`, [id, ...values]);
    await auditLog(req.user.id, 'UPDATE_CHILD', 'child', id, fields, req);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE children SET status = $1 WHERE id = $2', ['exited', id]);
    await auditLog(req.user.id, 'EXIT_CHILD', 'child', id, {}, req);
    res.json({ message: 'Child marked as exited.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await db.query("SELECT COUNT(*) FROM children WHERE status = 'active'");
    const newThisMonth = await db.query("SELECT COUNT(*) FROM children WHERE DATE_TRUNC('month', admission_date) = DATE_TRUNC('month', NOW())");
    const byGender = await db.query("SELECT gender, COUNT(*) FROM children WHERE status='active' GROUP BY gender");
    const byAge = await db.query(`
      SELECT CASE
        WHEN EXTRACT(YEAR FROM AGE(dob)) < 5 THEN 'Under 5'
        WHEN EXTRACT(YEAR FROM AGE(dob)) BETWEEN 5 AND 12 THEN '5-12'
        WHEN EXTRACT(YEAR FROM AGE(dob)) BETWEEN 13 AND 17 THEN '13-17'
        ELSE '18+' END AS age_group, COUNT(*)
      FROM children WHERE status='active' AND dob IS NOT NULL GROUP BY age_group
    `);
    res.json({
      total: parseInt(total.rows[0].count),
      new_this_month: parseInt(newThisMonth.rows[0].count),
      by_gender: byGender.rows,
      by_age: byAge.rows,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
