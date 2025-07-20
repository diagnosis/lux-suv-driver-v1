import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from '@expo/vector-icons/AntDesign';

import trackingService from '@/services/trackingService';
import NavigationButtons from '@/components/tracking/NavigationButtons';
import LiveLocation from '@/components/tracking/LiveLocation';

export default function TrackingScreen() {
  const [token, setToken] = useState('');
  const [userRole, setUserRole] = useState('driver');
  const [userId, setUserId] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [webSocketConnected, setWebSocketConnected] = useState(false);
  const router = useRouter();

  // Load user data
  useFocusEffect(
    useCallback(() => {
      loadUserData();
      return () => {
        trackingService.cleanup();
      };
    }, [])
  );

  const loadUserData = async () => {
    try {
      const [storedToken, userData] = await AsyncStorage.multiGet(['jwt_token', 'user_data']);
      if (storedToken[1] && userData[1]) {
        setToken(storedToken[1]);
        const user = JSON.parse(userData[1]);
        setUserRole(user.role || 'driver');
        setUserId(user.id?.toString() || '');
      } else {
        router.replace('/login');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      router.replace('/login');
    }
  };

  // Fetch active rides based on user role
  const { data: ridesData, isLoading, error, refetch } = useQuery({
    queryKey: ['activeRides', token, userRole],
    queryFn: async () => {
      if (userRole === 'dispatcher') {
        return await trackingService.getActiveRides(token);
      } else {
        // For drivers, get assigned bookings from dashboard data
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL || 'https://luxsuv-v4.onrender.com'}/driver/bookings/assigned`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      }
    },
    enabled: !!token,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Start tracking mutation
  const startTrackingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const result = await trackingService.startTrackingSession(bookingId, token);
      
      // Start location tracking
      await trackingService.startLocationTracking(
        bookingId,
        token,
        (locationData) => {
          setCurrentLocation(locationData);
        },
        (error) => {
          console.error('Location tracking error:', error);
        }
      );

      // Connect WebSocket
      trackingService.connectWebSocket(
        userId,
        userRole,
        bookingId,
        (message) => {
          console.log('WebSocket message:', message);
          // Handle real-time updates
        },
        (error) => {
          console.error('WebSocket error:', error);
          setWebSocketConnected(false);
        },
        () => {
          setWebSocketConnected(false);
        }
      );

      setWebSocketConnected(true);
      setIsTrackingActive(true);
      return result;
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  // Stop tracking mutation
  const stopTrackingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const result = await trackingService.stopTrackingSession(bookingId, token);
      trackingService.cleanup();
      setIsTrackingActive(false);
      setWebSocketConnected(false);
      setCurrentLocation(null);
      return result;
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  // Get navigation info mutation
  const navigationMutation = useMutation({
    mutationFn: (bookingId: number) => trackingService.getNavigationInfo(bookingId, token),
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleStartTracking = (booking: any) => {
    setSelectedBooking(booking);
    startTrackingMutation.mutate(booking.id);
  };

  const handleStopTracking = () => {
    if (selectedBooking) {
      stopTrackingMutation.mutate(selectedBooking.id);
      setSelectedBooking(null);
    }
  };

  const handleGetNavigation = (booking: any) => {
    navigationMutation.mutate(booking.id);
  };

  const renderDriverView = () => {
    const rides = Array.isArray(ridesData) ? ridesData : [];

    return (
      <>
        <Text style={styles.sectionTitle}>Your Assigned Rides</Text>
        
        {rides.length === 0 ? (
          <View style={styles.emptyState}>
            <AntDesign name="car" size={48} color="#b68d40" />
            <Text style={styles.emptyTitle}>No assigned rides</Text>
            <Text style={styles.emptySubtitle}>Check back later for new assignments</Text>
          </View>
        ) : (
          rides.map((ride: any) => (
            <View key={ride.id} style={styles.rideCard}>
              <View style={styles.rideHeader}>
                <Text style={styles.rideName}>{ride.your_name}</Text>
                <View style={styles.rideStatus}>
                  <Text style={styles.statusText}>{ride.book_status}</Text>
                </View>
              </View>

              <View style={styles.rideLocation}>
                <AntDesign name="enviromento" size={16} color="#b68d40" />
                <Text style={styles.locationText}>{ride.pickup_location}</Text>
              </View>

              {ride.dropoff_location && (
                <View style={styles.rideLocation}>
                  <AntDesign name="arrowright" size={16} color="#b68d40" />
                  <Text style={styles.locationText}>{ride.dropoff_location}</Text>
                </View>
              )}

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() => handleGetNavigation(ride)}
                  disabled={navigationMutation.isPending}
                >
                  <AntDesign name="enviromento" size={16} color="#d6ad60" />
                  <Text style={styles.navButtonText}>Navigation</Text>
                </TouchableOpacity>

                {!isTrackingActive || selectedBooking?.id !== ride.id ? (
                  <TouchableOpacity
                    style={styles.trackButton}
                    onPress={() => handleStartTracking(ride)}
                    disabled={startTrackingMutation.isPending}
                  >
                    {startTrackingMutation.isPending && selectedBooking?.id === ride.id ? (
                      <ActivityIndicator size="small" color="#122620" />
                    ) : (
                      <>
                        <AntDesign name="playcircle" size={16} color="#122620" />
                        <Text style={styles.trackButtonText}>Start Tracking</Text>
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.stopButton}
                    onPress={handleStopTracking}
                    disabled={stopTrackingMutation.isPending}
                  >
                    {stopTrackingMutation.isPending ? (
                      <ActivityIndicator size="small" color="#f4ebd0" />
                    ) : (
                      <>
                        <AntDesign name="pausecircle" size={16} color="#f4ebd0" />
                        <Text style={styles.stopButtonText}>Stop Tracking</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}

        {/* Show navigation info if available */}
        {navigationMutation.data && (
          <View style={styles.navigationContainer}>
            <Text style={styles.navigationTitle}>Navigation Options</Text>
            <NavigationButtons
              navigation={navigationMutation.data.navigation}
              type="directions"
              title="Get Directions"
            />
            <NavigationButtons
              navigation={navigationMutation.data.navigation}
              type="pickup"
              title="Navigate to Pickup"
            />
            <NavigationButtons
              navigation={navigationMutation.data.navigation}
              type="dropoff"
              title="Navigate to Dropoff"
            />
          </View>
        )}

        {/* Show current location if tracking */}
        {isTrackingActive && currentLocation && (
          <View style={styles.trackingContainer}>
            <Text style={styles.trackingTitle}>Active Tracking</Text>
            <LiveLocation
              location={currentLocation}
              driverName="You"
              bookingStatus="Tracking Active"
            />
            <View style={styles.connectionStatus}>
              <View style={[styles.statusDot, { backgroundColor: webSocketConnected ? '#6bcf7f' : '#ff6b6b' }]} />
              <Text style={styles.connectionText}>
                {webSocketConnected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </View>
        )}
      </>
    );
  };

  const renderDispatcherView = () => {
    const activeRides = ridesData?.active_rides || [];

    return (
      <>
        <Text style={styles.sectionTitle}>Active Rides ({ridesData?.count || 0})</Text>
        
        {activeRides.length === 0 ? (
          <View style={styles.emptyState}>
            <AntDesign name="dashboard" size={48} color="#b68d40" />
            <Text style={styles.emptyTitle}>No active rides</Text>
            <Text style={styles.emptySubtitle}>All rides are completed or not yet started</Text>
          </View>
        ) : (
          activeRides.map((ride: any) => (
            <View key={ride.booking_id} style={styles.rideCard}>
              <View style={styles.rideHeader}>
                <Text style={styles.rideName}>{ride.customer_name}</Text>
                <Text style={styles.driverInfo}>Driver ID: {ride.driver_id}</Text>
              </View>

              <View style={styles.rideLocation}>
                <AntDesign name="enviromento" size={16} color="#b68d40" />
                <Text style={styles.locationText}>{ride.pickup_location}</Text>
              </View>

              <View style={styles.rideLocation}>
                <AntDesign name="arrowright" size={16} color="#b68d40" />
                <Text style={styles.locationText}>{ride.dropoff_location}</Text>
              </View>

              {ride.current_location && (
                <LiveLocation
                  location={ride.current_location}
                  driverName={`Driver ${ride.driver_id}`}
                  bookingStatus="En Route"
                />
              )}
            </View>
          ))
        )}
      </>
    );
  };

  return (
    <LinearGradient colors={['#122620', '#1a3329']} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Live Tracking</Text>
          <Text style={styles.subtitle}>
            {userRole === 'dispatcher' ? 'Monitor all rides' : 'Track your rides'}
          </Text>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#d6ad60" />
            <Text style={styles.loadingText}>Loading rides...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <AntDesign name="exclamationcircle" size={20} color="#ff6b6b" />
            <Text style={styles.errorText}>{error.message}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!isLoading && !error && (
          userRole === 'dispatcher' ? renderDispatcherView() : renderDriverView()
        )}
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
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f4ebd0',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#b68d40',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f4ebd0',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#b68d40',
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: '#ff6b6b',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  retryText: {
    color: '#ff6b6b',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f4ebd0',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#b68d40',
    textAlign: 'center',
    lineHeight: 20,
  },
  rideCard: {
    backgroundColor: 'rgba(244, 235, 208, 0.05)',
    borderWidth: 1,
    borderColor: '#b68d40',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rideName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f4ebd0',
  },
  rideStatus: {
    backgroundColor: 'rgba(214, 173, 96, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#d6ad60',
    fontWeight: '600',
  },
  driverInfo: {
    fontSize: 12,
    color: '#d6ad60',
    fontWeight: '600',
  },
  rideLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#f4ebd0',
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(214, 173, 96, 0.1)',
    borderWidth: 1,
    borderColor: '#d6ad60',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  navButtonText: {
    color: '#d6ad60',
    fontSize: 14,
    fontWeight: '600',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d6ad60',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  trackButtonText: {
    color: '#122620',
    fontSize: 14,
    fontWeight: '600',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  stopButtonText: {
    color: '#f4ebd0',
    fontSize: 14,
    fontWeight: '600',
  },
  navigationContainer: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: 'rgba(244, 235, 208, 0.05)',
    borderWidth: 1,
    borderColor: '#b68d40',
    borderRadius: 16,
    padding: 20,
  },
  navigationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f4ebd0',
    marginBottom: 16,
  },
  trackingContainer: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  trackingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f4ebd0',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connectionText: {
    color: '#b68d40',
    fontSize: 12,
    fontWeight: '500',
  },
});