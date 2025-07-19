import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  RefreshControl
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AntDesign from '@expo/vector-icons/AntDesign';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
import API_CONFIG, { API_ENDPOINTS, buildUrl, getHeaders, handleApiError } from '@/config/api';

async function fetchDashboardData(token: string, userRole: string) {
    try {
        console.log('Fetching dashboard data for role:', userRole);
        
        let endpoint;
        
        // Choose endpoint based on user role
        switch (userRole) {
            case 'dispatcher':
                endpoint = API_ENDPOINTS.DISPATCHER_ALL_BOOKINGS;
                break;
            case 'super_driver':
                endpoint = API_ENDPOINTS.SUPER_DRIVER_AVAILABLE_BOOKINGS;
                break;
            case 'driver':
            default:
                endpoint = API_ENDPOINTS.DRIVER_ASSIGNED_BOOKINGS;
                break;
        }
        
        const url = buildUrl(endpoint);
        const headers = getHeaders(token);
        
        console.log('Making request to:', url);
        console.log('With headers:', headers);
        
        const response = await axios.get(buildUrl(endpoint), {
            headers: getHeaders(token),
            timeout: API_CONFIG.TIMEOUT,
        });
        
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        
        // Handle different response formats
        if (Array.isArray(response.data)) {
            return response.data; // For driver assigned bookings
        } else if (response.data.bookings) {
            return response.data.bookings; // For dispatcher/super-driver bookings
        }
        return [];
    } catch (error: any) {
        console.error('Dashboard fetch error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            code: error.code,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers,
            }
        });
        throw new Error(handleApiError(error));
    }
}

export default function DashboardScreen() {
    const [token, setToken] = React.useState('');
    const [userRole, setUserRole] = React.useState('driver');
    const [userName, setUserName] = React.useState('');
    const router = useRouter();

    useFocusEffect(
        React.useCallback(() => {
            async function loadToken() {
                const [storedToken, userData] = await AsyncStorage.multiGet(['jwt_token', 'user_data']);
                if (storedToken[1]) {
                    setToken(storedToken[1]);
                    if (userData[1]) {
                        const user = JSON.parse(userData[1]);
                        setUserRole(user.role || 'driver');
                        setUserName(user.username || 'Driver');
                    }
                } else {
                    router.replace('/login');
                }
            }
            loadToken();
        }, [])
    );

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['dashboardData', token, userRole],
        queryFn: () => fetchDashboardData(token, userRole),
        enabled: !!token,
        retry: 1,
    });

    const handleLogout = async () => {
        await AsyncStorage.multiRemove(['jwt_token', 'user_data']);
        router.replace('/login');
    };

    const getRoleDisplayName = (role: string) => {
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

    const getDashboardTitle = (role: string) => {
        switch (role) {
            case 'dispatcher':
                return 'All Bookings';
            case 'super_driver':
                return 'Available Bookings';
            case 'driver':
            default:
                return 'My Assigned Rides';
        }
    };
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (timeString: string) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
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
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Good morning, {getRoleDisplayName(userRole)}</Text>
                        <Text style={styles.userName}>{userName}</Text>
                        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}</Text>
                    </View>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <AntDesign name="logout" size={20} color="#d6ad60" />
                    </TouchableOpacity>
                </View>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <AntDesign name="car" size={24} color="#d6ad60" />
                        <Text style={styles.statNumber}>{data?.length || 0}</Text>
                        <Text style={styles.statLabel}>
                            {userRole === 'dispatcher' ? 'Total Bookings' : 
                             userRole === 'super_driver' ? 'Available Rides' : 'Assigned Rides'}
                        </Text>
                    </View>
                    <View style={styles.statCard}>
                        <AntDesign name="clockcircle" size={24} color="#d6ad60" />
                        <Text style={styles.statNumber}>8.5</Text>
                        <Text style={styles.statLabel}>Hours Today</Text>
                    </View>
                </View>

                {/* Rides Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{getDashboardTitle(userRole)}</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {isLoading && (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Loading rides...</Text>
                        </View>
                    )}

                    {error && (
                        <View style={styles.errorContainer}>
                            <AntDesign name="exclamationcircle" size={20} color="#ff6b6b" />
                            <Text style={styles.errorText}>{error.message || 'Failed to load rides'}</Text>
                            <TouchableOpacity 
                                style={styles.retryButton} 
                                onPress={() => refetch()}
                            >
                                <Text style={styles.retryText}>Retry</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {data && data.length > 0 ? (
                        data.map((ride: any) => (
                            <View key={ride.id} style={styles.rideCard}>
                                <View style={styles.rideHeader}>
                                    <View style={styles.rideInfo}>
                                        <Text style={styles.rideName}>{ride.your_name}</Text>
                                        <Text style={styles.rideTime}>
                                            {formatDate(ride.date)} • {formatTime(ride.time)}
                                        </Text>
                                        {ride.driver_name && (
                                            <Text style={styles.driverName}>
                                                Driver: {ride.driver_name}
                                            </Text>
                                        )}
                                    </View>
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
                                <TouchableOpacity style={styles.rideAction}>
                                    <Text style={styles.actionText}>
                                        {userRole === 'driver' && ride.book_status === 'Accepted' ? 'Start Ride' : 'View Details'}
                                    </Text>
                                    <AntDesign name="arrowright" size={16} color="#d6ad60" />
                                </TouchableOpacity>
                            </View>
                        ))
                    ) : (
                        !isLoading && (
                            <View style={styles.emptyState}>
                                <AntDesign name="car" size={48} color="#b68d40" />
                                <Text style={styles.emptyTitle}>
                                    {userRole === 'dispatcher' ? 'No bookings found' :
                                     userRole === 'super_driver' ? 'No available rides' : 'No assigned rides'}
                                </Text>
                                <Text style={styles.emptySubtitle}>
                                    {userRole === 'driver' ? 'Check back later for new assignments' : 'Check back later for new bookings'}
                                </Text>
                            </View>
                        )
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
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#f4ebd0',
        marginBottom: 4,
    },
    userName: {
        fontSize: 16,
        color: '#d6ad60',
        marginBottom: 4,
    },
    date: {
        fontSize: 14,
        color: '#b68d40',
    },
    logoutButton: {
        padding: 12,
        backgroundColor: 'rgba(244, 235, 208, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d6ad60',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginBottom: 32,
        gap: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(244, 235, 208, 0.05)',
        borderWidth: 1,
        borderColor: '#b68d40',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#f4ebd0',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#b68d40',
        textAlign: 'center',
    },
    section: {
        paddingHorizontal: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#f4ebd0',
    },
    seeAll: {
        fontSize: 14,
        color: '#d6ad60',
        fontWeight: '600',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        color: '#b68d40',
        fontSize: 16,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderWidth: 1,
        borderColor: '#ff6b6b',
        borderRadius: 12,
        padding: 16,
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
    rideCard: {
        backgroundColor: 'rgba(244, 235, 208, 0.05)',
        borderWidth: 1,
        borderColor: '#b68d40',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    rideHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    rideInfo: {
        flex: 1,
    },
    rideName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f4ebd0',
        marginBottom: 4,
    },
    rideTime: {
        fontSize: 14,
        color: '#b68d40',
    },
    driverName: {
        fontSize: 12,
        color: '#d6ad60',
        fontStyle: 'italic',
        marginTop: 2,
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
    rideLocation: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    locationText: {
        fontSize: 14,
        color: '#f4ebd0',
        marginLeft: 8,
        flex: 1,
    },
    rideAction: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(214, 173, 96, 0.1)',
        borderWidth: 1,
        borderColor: '#d6ad60',
        borderRadius: 12,
        paddingVertical: 12,
    },
    actionText: {
        fontSize: 14,
        color: '#d6ad60',
        fontWeight: '600',
        marginRight: 8,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 48,
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
});