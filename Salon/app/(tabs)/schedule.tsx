import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Clock, User, Phone, X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getBarberAppointments, updateAppointmentStatus } from '@/lib/appointments';
import { AppointmentWithDetails } from '@/types/database';

export default function ScheduleScreen() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const nextSevenDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      label: date.toLocaleDateString('en-GB', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      value: date.toISOString().split('T')[0],
      date: date,
    };
  });

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    const { data, error } = await getBarberAppointments();
    if (error) {
      Alert.alert('Error', 'Failed to load appointments');
    } else if (data) {
      setAppointments(data);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const filteredAppointments = appointments.filter(
    appointment => appointment.appointment_date === selectedDate
  );

  const handleCancelAppointment = (appointmentId: string) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: () => cancelAppointment(appointmentId)
        },
      ]
    );
  };

  const cancelAppointment = async (appointmentId: string) => {
    const { error } = await updateAppointmentStatus(appointmentId, 'cancelled');
    if (error) {
      Alert.alert('Error', 'Failed to cancel appointment');
    } else {
      Alert.alert('Success', 'Appointment cancelled successfully');
      loadAppointments();
    }
  };

  const confirmAppointment = async (appointmentId: string) => {
    const { error } = await updateAppointmentStatus(appointmentId, 'confirmed');
    if (error) {
      Alert.alert('Error', 'Failed to confirm appointment');
    } else {
      Alert.alert('Success', 'Appointment confirmed successfully');
      loadAppointments();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#F59E0B';
      case 'confirmed': return '#10B981';
      case 'completed': return '#6B7280';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#F8FAFC', '#E2E8F0']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#F8FAFC', '#E2E8F0']} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Weekly Schedule</Text>
          <Text style={styles.subtitle}>Manage your appointments</Text>
        </View>

        {/* Date Selection */}
        <View style={styles.dateSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.datesContainer}>
              {nextSevenDays.map((day) => (
                <TouchableOpacity
                  key={day.value}
                  style={[
                    styles.dateCard,
                    selectedDate === day.value && styles.dateCardSelected,
                  ]}
                  onPress={() => setSelectedDate(day.value)}
                >
                  <Calendar 
                    size={20} 
                    color={selectedDate === day.value ? '#FFFFFF' : '#6B46C1'} 
                  />
                  <Text style={[
                    styles.dateText,
                    selectedDate === day.value && styles.dateTextSelected,
                  ]}>
                    {day.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.content}>
          {filteredAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Calendar size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>No Appointments</Text>
              <Text style={styles.emptyStateText}>
                No appointments scheduled for this date.
              </Text>
            </View>
          ) : (
            filteredAppointments.map((appointment) => (
              <View key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <View style={styles.timeContainer}>
                    <Clock size={16} color="#6B46C1" />
                    <Text style={styles.timeText}>{appointment.appointment_time}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
                    <Text style={styles.statusText}>
                      {appointment.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.serviceName}>{appointment.service.name}</Text>
                <Text style={styles.serviceDuration}>
                  Duration: {appointment.service.duration_minutes} minutes
                </Text>
                
                <View style={styles.customerInfo}>
                  <View style={styles.customerRow}>
                    <User size={16} color="#6B7280" />
                    <Text style={styles.customerText}>{appointment.customer.full_name}</Text>
                  </View>
                  <View style={styles.customerRow}>
                    <Phone size={16} color="#6B7280" />
                    <Text style={styles.customerText}>{appointment.customer.phone}</Text>
                  </View>
                </View>
                
                <View style={styles.appointmentFooter}>
                  <Text style={styles.totalAmount}>LKR {appointment.total_amount}</Text>
                  
                  <View style={styles.actionButtons}>
                    {appointment.status === 'scheduled' && (
                      <>
                        <TouchableOpacity
                          style={styles.confirmButton}
                          onPress={() => confirmAppointment(appointment.id)}
                        >
                          <Text style={styles.confirmButtonText}>Confirm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={() => handleCancelAppointment(appointment.id)}
                        >
                          <X size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  dateSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  datesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateCardSelected: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
    textAlign: 'center',
  },
  dateTextSelected: {
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B46C1',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  customerInfo: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerText: {
    fontSize: 14,
    color: '#374151',
  },
  appointmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});