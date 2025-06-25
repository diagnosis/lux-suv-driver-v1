import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://luxsuv-backend.fly.dev';

async function fetchDashboardData(token) {
    try {
        const response = await axios.get(`${API_URL}/driver/book-rides`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error('Fetch error:', error.response?.status, error.response?.data);
        throw new Error('Failed to fetch dashboard data');
    }
}

export default function DashboardScreen() {
    const [token, setToken] = React.useState('');

    useFocusEffect(
        React.useCallback(() => {
            async function loadToken() {
                const storedToken = await AsyncStorage.getItem('jwt_token');
                if (storedToken) setToken(storedToken);
                else console.warn('No token found in AsyncStorage');
            }
            loadToken();
        }, [])
    );

    const { data, isLoading, error } = useQuery({
        queryKey: ['dashboardData', token],
        queryFn: () => fetchDashboardData(token),
        enabled: !!token,
        retry: 1, // Limit retries to avoid infinite loops
    });

    const handleLogout = async () => {
        await AsyncStorage.removeItem('jwt_token');
        setToken('');
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Driver Dashboard</Text>
            <Text style={styles.subtitle}>Welcome! Today's Date: {new Date().toLocaleDateString()}</Text>

            {isLoading && <Text>Loading...</Text>}
            {error && <Text>Error: {error.message}</Text>}

            {data && (
                <View>
                    <Text style={styles.sectionTitle}>Active Rides</Text>
                    {data.length > 0 ? (
                        data.map((ride) => (
                            <View key={ride.id} style={styles.rideItem}>
                                <Text>{ride.your_name} - {ride.pickup_location}</Text>
                                <Text>{ride.date} {ride.time}</Text>
                            </View>
                        ))
                    ) : (
                        <Text>No active rides</Text>
                    )}
                </View>
            )}

            <Button title="Logout" onPress={handleLogout} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    rideItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 10,
    },
});