import { supabase } from './supabase';
import { Appointment, AppointmentWithDetails, Service } from '@/types/database';

export const createAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('appointments')
    .insert([appointmentData])
    .select('*')
    .single();
  
  return { data, error };
};

export const getCustomerAppointments = async (customerId: string) => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      service:services(*),
      barber:users(*)
    `)
    .eq('customer_id', customerId)
    .order('appointment_date', { ascending: false });
  
  return { data: data as AppointmentWithDetails[], error };
};

export const getBarberAppointments = async (barberId?: string) => {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      customer:users!appointments_customer_id_fkey(*),
      service:services(*)
    `);
    
  if (barberId) {
    query = query.eq('barber_id', barberId);
  }
  
  const { data, error } = await query
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true });
  
  return { data: data as AppointmentWithDetails[], error };
};

export const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status'], cancellationFee?: number) => {
  const updateData: any = { status, updated_at: new Date().toISOString() };
  if (cancellationFee) {
    updateData.cancellation_fee = cancellationFee;
  }
  
  const { data, error } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', appointmentId)
    .select('*')
    .single();
  
  return { data, error };
};

export const getServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('name');
  
  return { data: data as Service[], error };
};

export const updateServicePrice = async (serviceId: string, price: number) => {
  const { data, error } = await supabase
    .from('services')
    .update({ price, updated_at: new Date().toISOString() })
    .eq('id', serviceId)
    .select('*')
    .single();
  
  return { data, error };
};