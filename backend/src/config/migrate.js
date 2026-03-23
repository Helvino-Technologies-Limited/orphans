const db = require('./db');

async function migrate() {
  console.log('🔄 Running database migrations...');

  const queries = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'caregiver',
      phone VARCHAR(20),
      avatar_url TEXT,
      is_active BOOLEAN DEFAULT true,
      last_login TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    // Children table
    `CREATE TABLE IF NOT EXISTS children (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      child_no VARCHAR(50) UNIQUE NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      gender VARCHAR(10) NOT NULL,
      dob DATE,
      estimated_age INTEGER,
      photo_url TEXT,
      admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
      background TEXT,
      guardian_name VARCHAR(255),
      guardian_contact VARCHAR(50),
      guardian_relationship VARCHAR(100),
      status VARCHAR(50) DEFAULT 'active',
      special_needs TEXT,
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    // Staff table
    `CREATE TABLE IF NOT EXISTS staff (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      name VARCHAR(255) NOT NULL,
      role VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      email VARCHAR(255),
      id_number VARCHAR(50),
      employment_date DATE,
      shift VARCHAR(50),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // Health records
    `CREATE TABLE IF NOT EXISTS health_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      child_id UUID REFERENCES children(id) ON DELETE CASCADE,
      record_type VARCHAR(100) NOT NULL,
      description TEXT,
      diagnosis TEXT,
      treatment TEXT,
      doctor_name VARCHAR(255),
      visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
      next_visit DATE,
      medications TEXT,
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // Vaccinations
    `CREATE TABLE IF NOT EXISTS vaccinations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      child_id UUID REFERENCES children(id) ON DELETE CASCADE,
      vaccine_name VARCHAR(255) NOT NULL,
      date_given DATE,
      next_due DATE,
      given_by VARCHAR(255),
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // Education records
    `CREATE TABLE IF NOT EXISTS education_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      child_id UUID REFERENCES children(id) ON DELETE CASCADE,
      school_name VARCHAR(255),
      grade VARCHAR(50),
      academic_year VARCHAR(20),
      enrollment_date DATE,
      performance_notes TEXT,
      attendance_percentage DECIMAL(5,2),
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // Activities
    `CREATE TABLE IF NOT EXISTS activities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      child_id UUID REFERENCES children(id) ON DELETE CASCADE,
      activity_type VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      activity_date DATE DEFAULT CURRENT_DATE,
      recorded_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // Donations
    `CREATE TABLE IF NOT EXISTS donations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      donor_name VARCHAR(255) NOT NULL,
      donor_email VARCHAR(255),
      donor_phone VARCHAR(50),
      amount DECIMAL(15,2),
      donation_type VARCHAR(50) NOT NULL,
      item_description TEXT,
      payment_method VARCHAR(50),
      mpesa_ref VARCHAR(100),
      receipt_no VARCHAR(100),
      status VARCHAR(50) DEFAULT 'confirmed',
      notes TEXT,
      donated_at TIMESTAMP DEFAULT NOW(),
      recorded_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // Expenses
    `CREATE TABLE IF NOT EXISTS expenses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      category VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      expense_date DATE DEFAULT CURRENT_DATE,
      receipt_url TEXT,
      approved_by UUID REFERENCES users(id),
      recorded_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // Inventory
    `CREATE TABLE IF NOT EXISTS inventory (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      item_name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
      unit VARCHAR(50),
      minimum_stock DECIMAL(10,2) DEFAULT 10,
      last_restocked DATE,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    // Inventory transactions
    `CREATE TABLE IF NOT EXISTS inventory_transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      inventory_id UUID REFERENCES inventory(id),
      transaction_type VARCHAR(20) NOT NULL,
      quantity DECIMAL(10,2) NOT NULL,
      notes TEXT,
      recorded_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // Audit logs
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id),
      action VARCHAR(255) NOT NULL,
      entity_type VARCHAR(100),
      entity_id UUID,
      details JSONB,
      ip_address VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // Incidents
    `CREATE TABLE IF NOT EXISTS incidents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      incident_type VARCHAR(100),
      severity VARCHAR(50) DEFAULT 'low',
      child_id UUID REFERENCES children(id),
      reported_by UUID REFERENCES users(id),
      status VARCHAR(50) DEFAULT 'open',
      resolved_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // Staff attendance
    `CREATE TABLE IF NOT EXISTS staff_attendance (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      staff_id UUID REFERENCES staff(id),
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      check_in TIME,
      check_out TIME,
      status VARCHAR(50) DEFAULT 'present',
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // Documents
    `CREATE TABLE IF NOT EXISTS documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      child_id UUID REFERENCES children(id) ON DELETE CASCADE,
      document_type VARCHAR(100) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_url TEXT NOT NULL,
      uploaded_by UUID REFERENCES users(id),
      created_at TIMESTAMP DEFAULT NOW()
    )`,
  ];

  for (const query of queries) {
    await db.query(query);
  }

  console.log('✅ Migrations complete!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
