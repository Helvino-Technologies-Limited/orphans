const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM inventory ORDER BY category, item_name');
    const lowStock = result.rows.filter(i => i.quantity <= i.minimum_stock);
    res.json({ items: result.rows, low_stock: lowStock });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.create = async (req, res) => {
  try {
    const { item_name, category, quantity, unit, minimum_stock } = req.body;
    const result = await db.query(
      `INSERT INTO inventory (item_name, category, quantity, unit, minimum_stock, last_restocked)
       VALUES ($1,$2,$3,$4,$5,CURRENT_DATE) RETURNING *`,
      [item_name, category, quantity, unit, minimum_stock]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { transaction_type, quantity, notes } = req.body;
    const op = transaction_type === 'add' ? '+' : '-';
    const result = await db.query(
      `UPDATE inventory SET quantity = quantity ${op} $1, updated_at = NOW(), last_restocked = CASE WHEN $2='add' THEN CURRENT_DATE ELSE last_restocked END WHERE id = $3 RETURNING *`,
      [quantity, transaction_type, id]
    );
    await db.query(
      `INSERT INTO inventory_transactions (inventory_id, transaction_type, quantity, notes, recorded_by) VALUES ($1,$2,$3,$4,$5)`,
      [id, transaction_type, quantity, notes, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
