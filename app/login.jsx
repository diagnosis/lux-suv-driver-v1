import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import AntDesign from '@expo/vector-icons/AntDesign';

const API_URL = 'https://luxsuv-backend.fly.dev';

async function loginDriver(credentials) {
    const response = await axios.post(`${API_URL}/driver/login`, credentials);
    return response.data;
}

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: loginDriver,
        onSuccess: async (data) => {
            await AsyncStorage.setItem('jwt_token', data.token);
            router.replace('/dashboard');
        },
        onError: () => {
            Alert.alert('Error', 'Invalid credentials');
        },
    });

    const handleLogin = () => {
        mutation.mutate({ username, password });
    };

    return (
        <View style={styles.container}>
            <AntDesign name="car" size={24} color="black" />
            <Text style={styles.title}>Driver Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button
                title="Login"
                onPress={handleLogin}
                disabled={mutation.isLoading}
            />
            {mutation.isLoading && <Text>Logging in...</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
    },
});