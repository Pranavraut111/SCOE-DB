export interface StudentBase {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  state: string;
  country: string;
  postal_code?: string;
  admission_number: string;
  roll_number: string;
  institutional_email: string;
  department: string;
  created_at: string;
  updated_at: string;
  // Additional fields
  category?: string;
  branch?: string;
  year?: string;
  mother_name: string;
  photo?: string;
  subjects?: string[];
}

export interface Student extends StudentBase {
  // Legacy fields for compatibility
  rollNumber?: string;
  personalEmail?: string;
  name?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  motherName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentCreate {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  state?: string;
  country?: string;
  postal_code?: string;
  admission_number: string;
  roll_number: string;
  institutional_email?: string;
  department?: string;
  category?: string;
  branch?: string;
  year?: string;
  mother_name: string;
  photo?: string;
}

export const BRANCHES = [
  'Computer Science Engineering',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
] as const;