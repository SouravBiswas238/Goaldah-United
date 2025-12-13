import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import colors from '../../styles/colors';
import typography from '../../styles/typography';
import spacing from '../../styles/spacing';

const LoginScreen = ({ navigation }) => {
    const { login } = useAuth();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        if (!phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (phone.length < 10) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;

        setLoading(true);
        const result = await login(phone, password);
        setLoading(false);

        if (!result.success) {
            Alert.alert('Login Failed', result.message);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Phone Number"
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Enter your phone number"
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                        error={errors.phone}
                    />

                    <Input
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        secureTextEntry
                        error={errors.password}
                    />

                    <Button
                        title="Login"
                        onPress={handleLogin}
                        loading={loading}
                        style={styles.loginButton}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <Button
                            title="Register"
                            onPress={() => navigation.navigate('Register')}
                            variant="outline"
                        />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        padding: spacing.paddingLg,
        justifyContent: 'center',
    },
    header: {
        marginBottom: spacing.marginXl,
        alignItems: 'center',
    },
    title: {
        fontSize: typography['3xl'],
        fontWeight: typography.bold,
        color: colors.textPrimary,
        marginBottom: spacing.marginSm,
    },
    subtitle: {
        fontSize: typography.base,
        color: colors.textSecondary,
    },
    form: {
        width: '100%',
    },
    loginButton: {
        marginTop: spacing.marginMd,
    },
    footer: {
        marginTop: spacing.marginLg,
        alignItems: 'center',
    },
    footerText: {
        fontSize: typography.sm,
        color: colors.textSecondary,
        marginBottom: spacing.marginSm,
    },
});

export default LoginScreen;
