import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import AntDesign from '@expo/vector-icons/AntDesign';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const API_URL = 'https://luxsuv-backend.fly.dev';

async function loginDriver(credentials) {
    const response = await axios.post(`${API_URL}/driver/login`, credentials);
    return response.data;
}

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const mutation = useMutation({
        mutationFn: loginDriver,
        onSuccess: async (data) => {
            await AsyncStorage.setItem('jwt_token', data.token);
            setError(null);
            router.replace('/(tabs)/dashboard');
        },
        onError: (error) => {
            setError('Invalid credentials. Please try again.');
        },
    });

    const handleLogin = () => {
        if (!username.trim() || !password.trim()) {
            setError('Please fill in all fields');
            return;
        }
        setError(null);
        mutation.mutate({ username: username.trim(), password });
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient
                colors={['#122620', '#1a3329', '#122620']}
                style={styles.gradient}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Section */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoBackground}>
                                <AntDesign name="car" size={48} color="#d6ad60" />
                            </View>
                        </View>
                        <Text style={styles.title}>LuxSUV Driver</Text>
                        <Text style={styles.subtitle}>Welcome back, driver</Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.formContainer}>
                        {error && (
                            <View style={styles.errorContainer}>
                                <AntDesign name="exclamationcircle" size={16} color="#ff6b6b" />
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <View style={styles.inputContainer}>
                            <View style={styles.inputWrapper}>
                                <AntDesign name="user" size={20} color="#b68d40" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Username"
                                    placeholderTextColor="#b68d40"
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            <View style={styles.inputWrapper}>
                                <AntDesign name="lock" size={20} color="#b68d40" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor="#b68d40"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                                <TouchableOpacity
                                    style={styles.eyeIcon}
                                    onPress={() => setShowPassword(!showPassword)}
                                >
                                    <AntDesign 
                                        name={showPassword ? "eye" : "eyeo"} 
                                        size={20} 
                                        color="#b68d40" 
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.loginButton, mutation.isPending && styles.loginButtonDisabled]}
                            onPress={handleLogin}
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? (
                                <ActivityIndicator size="small" color="#122620" />
                            ) : (
                                <>
                                    <Text style={styles.loginButtonText}>Sign In</Text>
                                    <AntDesign name="arrowright" size={20} color="#122620" />
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.forgotPassword}>
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Need help? Contact support
                        </Text>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoBackground: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(244, 235, 208, 0.1)',
        borderWidth: 2,
        borderColor: '#d6ad60',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#f4ebd0',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#b68d40',
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        borderWidth: 1,
        borderColor: '#ff6b6b',
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
    inputContainer: {
        marginBottom: 32,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(244, 235, 208, 0.05)',
        borderWidth: 1,
        borderColor: '#b68d40',
        borderRadius: 16,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#f4ebd0',
        height: '100%',
    },
    eyeIcon: {
        padding: 4,
    },
    loginButton: {
        backgroundColor: '#d6ad60',
        borderRadius: 16,
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: '#d6ad60',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: '#122620',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
    },
    forgotPassword: {
        alignItems: 'center',
    },
    forgotPasswordText: {
        color: '#b68d40',
        fontSize: 14,
        textDecorationLine: 'underline',
    },
    footer: {
        alignItems: 'center',
        marginTop: 48,
    },
    footerText: {
        color: '#b68d40',
        fontSize: 12,
        textAlign: 'center',
    },
});