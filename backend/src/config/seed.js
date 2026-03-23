const db = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  console.log('🌱 Seeding database...');

  const adminId = uuidv4();
  const password = await bcrypt.hash('Admin@1234', 12);

  await db.query(`
    INSERT INTO users (id, name, email, password_hash, role, phone)
    VALUES ($1, 'System Administrator', 'admin@omms.org', $2, 'admin', '0700000000')
    ON CONFLICT (email) DO NOTHING
  `, [adminId, password]);

  const caregiverId = uuidv4();
  const cgPass = await bcrypt.hash('Care@1234', 12);
  await db.query(`
    INSERT INTO users (id, name, email, password_hash, role, phone)
    VALUES ($1, 'Jane Caregiver', 'caregiver@omms.org', $2, 'caregiver', '0711111111')
    ON CONFLICT (email) DO NOTHING
  `, [caregiverId, cgPass]);

  // Sample inventory
  const items = [
    ['Rice', 'Food', 50, 'kg', 20],
    ['Maize Flour', 'Food', 30, 'kg', 15],
    ['Cooking Oil', 'Food', 10, 'litres', 5],
    ['Paracetamol', 'Medicine', 100, 'tablets', 50],
    ['ORS Sachets', 'Medicine', 20, 'sachets', 10],
    ['Blankets', 'Clothing', 25, 'pieces', 10],
    ['School Uniforms', 'Clothing', 15, 'pieces', 5],
  ];

  for (const [name, cat, qty, unit, min] of items) {
    await db.query(`
      INSERT INTO inventory (item_name, category, quantity, unit, minimum_stock)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT DO NOTHING
    `, [name, cat, qty, unit, min]);
  }

  console.log('✅ Seeding complete!');
  console.log('📧 Admin: admin@omms.org | Password: Admin@1234');
  console.log('📧 Caregiver: caregiver@omms.org | Password: Care@1234');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
