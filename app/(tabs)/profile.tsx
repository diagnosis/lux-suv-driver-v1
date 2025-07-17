import React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUserData = await AsyncStorage.getItem('user_data');
      if (storedUserData) {
        setUserData(JSON.parse(storedUserData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'dispatcher':
        return 'Dispatcher';
      case 'super_driver':
        return 'Super Driver';
      case 'driver':
      default:
        return 'Driver';
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['jwt_token', 'user_data']);
    router.replace('/login');
  };

  return (
    <LinearGradient colors={['#122620', '#1a3329']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <AntDesign name="user" size={48} color="#d6ad60" />
          </View>
          <Text style={styles.name}>{userData?.username || 'Driver'}</Text>
          <Text style={styles.role}>{getRoleDisplayName(userData?.role)}</Text>
          <Text style={styles.email}>{userData?.email || 'driver@luxsuv.com'}</Text>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <AntDesign name="setting" size={20} color="#d6ad60" />
            <Text style={styles.menuText}>Settings</Text>
            <AntDesign name="right" size={16} color="#b68d40" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <AntDesign name="questioncircle" size={20} color="#d6ad60" />
            <Text style={styles.menuText}>Help & Support</Text>
            <AntDesign name="right" size={16} color="#b68d40" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <AntDesign name="infocirlce" size={20} color="#d6ad60" />
            <Text style={styles.menuText}>About</Text>
            <AntDesign name="right" size={16} color="#b68d40" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <AntDesign name="logout" size={20} color="#ff6b6b" />
            <Text style={[styles.menuText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(244, 235, 208, 0.1)',
    borderWidth: 2,
    borderColor: '#d6ad60',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f4ebd0',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#b68d40',
  },
  role: {
    fontSize: 14,
    color: '#d6ad60',
    fontWeight: '600',
    marginBottom: 4,
  },
  menuSection: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 235, 208, 0.05)',
    borderWidth: 1,
    borderColor: '#b68d40',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#f4ebd0',
    marginLeft: 16,
    fontWeight: '500',
  },
  logoutItem: {
    borderColor: '#ff6b6b',
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
  },
  logoutText: {
    color: '#ff6b6b',
  },
});