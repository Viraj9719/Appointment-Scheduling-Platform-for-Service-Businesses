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
import { Calendar, Clock, CreditCard, DollarSign } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getServices, createAppointment } from '@/lib/appointments';
import { Service } from '@/types/database';
import RNPickerSelect from 'react-native-picker-select';

export default function BookingScreen() {
  const { user, userProfile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  ];

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
    };
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const { data, error } = await getServices();
    if (error) {
      Alert.alert('Error', 'Failed to load services');
    } else if (data) {
      setServices(data);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please fill in all booking details');
      return;
    }

    const service = services.find(s => s.id === selectedService);
    if (!service) return;

    setLoading(true);
    try {
      const appointmentData = {
        customer_id: user!.id,
        service_id: selectedService,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        status: 'scheduled' as const,
        payment_method: paymentMethod,
        payment_status: 'pending' as const,
        total_amount: service.price,
      };

      const { error } = await createAppointment(appointmentData);
      
      if (error) {
        Alert.alert('Booking Failed', error.message);
      } else {
        Alert.alert('Success', 'Appointment booked successfully!', [
          { 
            text: 'OK', 
            onPress: () => {
              setSelectedService('');
              setSelectedDate('');
              setSelectedTime('');
            }
          }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#F8FAFC', '#E2E8F0']} style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Book Appointment</Text>
          <Text style={styles.subtitle}>Schedule your visit at Shalika Salon</Text>
        </View>

        <View style={styles.content}>
          {/* Service Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Service</Text>
            <View style={styles.servicesGrid}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceCard,
                    selectedService === service.id && styles.serviceCardSelected,
                  ]}
                  onPress={() => setSelectedService(service.id)}
                >
                  <Scissors 
                    size={24} 
                    color={selectedService === service.id ? '#FFFFFF' : '#6B46C1'} 
                  />
                  <Text style={[
                    styles.serviceName,
                    selectedService === service.id && styles.serviceNameSelected,
                  ]}>
                    {service.name}
                  </Text>
                  <Text style={[
                    styles.servicePrice,
                    selectedService === service.id && styles.servicePriceSelected,
                  ]}>
                    LKR {service.price}
                  </Text>
                  <Text style={[
                    styles.serviceDuration,
                    selectedService === service.id && styles.serviceDurationSelected,
                  ]}>
                    {service.duration_minutes} mins
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <View style={styles.datesGrid}>
              {nextSevenDays.map((date) => (
                <TouchableOpacity
                  key={date.value}
                  style={[
                    styles.dateCard,
                    selectedDate === date.value && styles.dateCardSelected,
                  ]}
                  onPress={() => setSelectedDate(date.value)}
                >
                  <Calendar 
                    size={20} 
                    color={selectedDate === date.value ? '#FFFFFF' : '#6B46C1'} 
                  />
                  <Text style={[
                    styles.dateText,
                    selectedDate === date.value && styles.dateTextSelected,
                  ]}>
                    {date.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Time Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Time</Text>
            <View style={styles.timesGrid}>
              {timeSlots.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeCard,
                    selectedTime === time && styles.timeCardSelected,
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Clock 
                    size={16} 
                    color={selectedTime === time ? '#FFFFFF' : '#6B46C1'} 
                  />
                  <Text style={[
                    styles.timeText,
                    selectedTime === time && styles.timeTextSelected,
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <View style={styles.paymentGrid}>
              <TouchableOpacity
                style={[
                  styles.paymentCard,
                  paymentMethod === 'cash' && styles.paymentCardSelected,
                ]}
                onPress={() => setPaymentMethod('cash')}
              >
                <DollarSign 
                  size={24} 
                  color={paymentMethod === 'cash' ? '#FFFFFF' : '#6B46C1'} 
                />
                <Text style={[
                  styles.paymentText,
                  paymentMethod === 'cash' && styles.paymentTextSelected,
                ]}>
                  Pay with Cash
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.paymentCard,
                  paymentMethod === 'online' && styles.paymentCardSelected,
                ]}
                onPress={() => setPaymentMethod('online')}
              >
                <CreditCard 
                  size={24} 
                  color={paymentMethod === 'online' ? '#FFFFFF' : '#6B46C1'} 
                />
                <Text style={[
                  styles.paymentText,
                  paymentMethod === 'online' && styles.paymentTextSelected,
                ]}>
                  Pay Online
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Book Button */}
          <TouchableOpacity
            style={[styles.bookButton, loading && styles.bookButtonDisabled]}
            onPress={handleBooking}
            disabled={loading}
          >
            <Text style={styles.bookButtonText}>
              {loading ? 'Booking...' : 'Book Appointment'}
            </Text>
          </TouchableOpacity>
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
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  servicesGrid: {
    gap: 12,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceCardSelected: {
    borderColor: '#D4AF37',
    backgroundColor: '#6B46C1',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  serviceNameSelected: {
    color: '#FFFFFF',
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
    marginRight: 8,
  },
  servicePriceSelected: {
    color: '#FEF3C7',
  },
  serviceDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  serviceDurationSelected: {
    color: '#E5E7EB',
  },
  datesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    minWidth: 80,
    flex: 1,
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
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeCard: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    minWidth: 70,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  timeCardSelected: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  timeTextSelected: {
    color: '#FFFFFF',
  },
  paymentGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    flex: 1,
  },
  paymentCardSelected: {
    backgroundColor: '#6B46C1',
    borderColor: '#6B46C1',
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
  paymentTextSelected: {
    color: '#FFFFFF',
  },
  bookButton: {
    backgroundColor: '#D4AF37',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bookButtonDisabled: {
    opacity: 0.7,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});