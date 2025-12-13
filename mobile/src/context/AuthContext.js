import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on app start
    useEffect(() => {
        checkLoggedIn();
    }, []);

    const checkLoggedIn = async () => {
        try {
            const [token, userJson] = await AsyncStorage.multiGet([
                STORAGE_KEYS.TOKEN,
                STORAGE_KEYS.USER,
            ]);

            if (token[1] && userJson[1]) {
                setUser(JSON.parse(userJson[1]));
            }
        } catch (error) {
            console.error('Error checking login status:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (phone, password) => {
        try {
            const response = await api.post('/auth/login', { phone, password });
            const { token, user: userData } = response.data;

            // Save to AsyncStorage
            await AsyncStorage.multiSet([
                [STORAGE_KEYS.TOKEN, token],
                [STORAGE_KEYS.USER, JSON.stringify(userData)],
            ]);

            setUser(userData);
            return { success: true, user: userData };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Login failed',
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            const { token, user: newUser } = response.data;

            // Save to AsyncStorage
            await AsyncStorage.multiSet([
                [STORAGE_KEYS.TOKEN, token],
                [STORAGE_KEYS.USER, JSON.stringify(newUser)],
            ]);

            setUser(newUser);
            return { success: true, user: newUser };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Registration failed',
            };
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
            setUser(null);
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    const updateUser = async (updatedUserData) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUserData));
            setUser(updatedUserData);
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                updateUser,
                isAdmin: user?.role === 'admin',
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
