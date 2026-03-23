export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'caregiver' | 'nurse';
  phone?: string;
  avatar_url?: string;
}

export interface Child {
  id: string;
  child_no: string;
  full_name: string;
  gender: string;
  dob?: string;
  estimated_age?: number;
  photo_url?: string;
  admission_date: string;
  background?: string;
  guardian_name?: string;
  guardian_contact?: string;
  guardian_relationship?: string;
  status: 'active' | 'exited' | 'transferred';
  special_needs?: string;
  created_at: string;
  health_records?: HealthRecord[];
  education_records?: EducationRecord[];
  activities?: Activity[];
  vaccinations?: Vaccination[];
}

export interface Staff {
  id: string;
  user_id?: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  id_number?: string;
  employment_date?: string;
  shift?: string;
  is_active: boolean;
  created_at: string;
}

export interface HealthRecord {
  id: string;
  child_id: string;
  record_type: string;
  description?: string;
  diagnosis?: string;
  treatment?: string;
  doctor_name?: string;
  visit_date: string;
  next_visit?: string;
  medications?: string;
}

export interface Vaccination {
  id: string;
  child_id: string;
  vaccine_name: string;
  date_given?: string;
  next_due?: string;
  given_by?: string;
}

export interface EducationRecord {
  id: string;
  child_id: string;
  school_name?: string;
  grade?: string;
  academic_year?: string;
  attendance_percentage?: number;
}

export interface Activity {
  id: string;
  child_id: string;
  child_name?: string;
  activity_type: string;
  description: string;
  activity_date: string;
  recorded_by_name?: string;
}

export interface Donation {
  id: string;
  donor_name: string;
  donor_email?: string;
  donor_phone?: string;
  amount?: number;
  donation_type: 'cash' | 'mpesa' | 'in-kind' | 'bank';
  item_description?: string;
  payment_method?: string;
  mpesa_ref?: string;
  receipt_no?: string;
  status: string;
  created_at: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  expense_date: string;
}

export interface InventoryItem {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  minimum_stock: number;
  last_restocked?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  incident_type?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  child_name?: string;
  reported_by_name?: string;
  status: 'open' | 'resolved';
  created_at: string;
}

export interface DashboardStats {
  total_children: number;
  total_staff: number;
  monthly_donations: number;
  monthly_expenses: number;
  low_stock_alerts: number;
  open_incidents: number;
  new_admissions_this_month: number;
  recent_activities: Activity[];
  monthly_trend: Array<{ month: string; count: number }>;
}
