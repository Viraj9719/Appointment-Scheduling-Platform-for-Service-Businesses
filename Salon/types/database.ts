export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'customer' | 'barber';
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  customer_id: string;
  service_id: string;
  barber_id?: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  payment_method: 'cash' | 'online';
  payment_status: 'pending' | 'paid' | 'refunded';
  total_amount: number;
  cancellation_fee?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentWithDetails extends Appointment {
  customer: User;
  service: Service;
  barber?: User;
}