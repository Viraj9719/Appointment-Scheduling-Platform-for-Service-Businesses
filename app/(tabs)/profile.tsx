import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Phone, LogOut, Crown } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, userProfile, signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          }
        },
      ]
    );
  };

  return (
    <LinearGradient colors={['#F8FAFC', '#E2E8F0']} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#6B46C1', '#9333EA']}
            style={styles.profileImageContainer}
          >
            <User size={48} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.name}>{userProfile?.full_name || 'User'}</Text>
          <View style={styles.roleBadge}>
            {userProfile?.role === 'barber' && <Crown size={16} color="#D4AF37" />}
            <Text style={styles.roleText}>
              {userProfile?.role === 'barber' ? 'Barber' : 'Customer'}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Profile Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Mail size={20} color="#6B46C1" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user?.email}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <Phone size={20} color="#6B46C1" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{userProfile?.phone}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <User size={20} color="#6B46C1" />
                <View style={styles.infoText}>
                  <Text style={styles.infoLabel}>Full Name</Text>
                  <Text style={styles.infoValue}>{userProfile?.full_name}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Salon Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Salon Information</Text>
            
            <View style={styles.salonCard}>
              <LinearGradient
                colors={['#6B46C1', '#D4AF37']}
                style={styles.salonHeader}
              >
                <Text style={styles.salonName}>Shalika Salon</Text>
                <Text style={styles.salonTagline}>Premium Hair & Beauty Services</Text>
              </LinearGradient>
              
              <View style={styles.salonInfo}>
                <Text style={styles.salonDetail}>📍 123 Main Street, Colombo 07</Text>
                <Text style={styles.salonDetail}>📞 +94 11 234 5678</Text>
                <Text style={styles.salonDetail}>🕒 Open: 9:00 AM - 6:00 PM</Text>
                <Text style={styles.salonDetail}>📅 Monday - Saturday</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <LogOut size={20} color="#FFFFFF" />
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
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
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
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
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoText: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  salonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  salonHeader: {
    padding: 20,
    alignItems: 'center',
  },
  salonName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  salonTagline: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  salonInfo: {
    padding: 20,
    gap: 8,
  },
  salonDetail: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  signOutButton: {
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});