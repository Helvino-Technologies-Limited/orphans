const db = require('../config/db');

const auditLog = async (userId, action, entityType, entityId, details, req) => {
  try {
    await db.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, action, entityType, entityId, JSON.stringify(details), req?.ip]
    );
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

module.exports = { auditLog };
