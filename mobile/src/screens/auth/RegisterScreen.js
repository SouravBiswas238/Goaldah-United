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

const RegisterScreen = ({ navigation }) => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const updateField = (field, value) => {
        setFormData({ ...formData, [field]: value });
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (formData.phone.length < 10) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;

        setLoading(true);
        const result = await register({
            name: formData.name,
            phone: formData.phone,
            password: formData.password,
        });
        setLoading(false);

        if (!result.success) {
            Alert.alert('Registration Failed', result.message);
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
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join Goaldah United</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Full Name"
                        value={formData.name}
                        onChangeText={(value) => updateField('name', value)}
                        placeholder="Enter your full name"
                        error={errors.name}
                    />

                    <Input
                        label="Phone Number"
                        value={formData.phone}
                        onChangeText={(value) => updateField('phone', value)}
                        placeholder="Enter your phone number"
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                        error={errors.phone}
                    />

                    <Input
                        label="Password"
                        value={formData.password}
                        onChangeText={(value) => updateField('password', value)}
                        placeholder="Create a password"
                        secureTextEntry
                        error={errors.password}
                    />

                    <Input
                        label="Confirm Password"
                        value={formData.confirmPassword}
                        onChangeText={(value) => updateField('confirmPassword', value)}
                        placeholder="Confirm your password"
                        secureTextEntry
                        error={errors.confirmPassword}
                    />

                    <Button
                        title="Register"
                        onPress={handleRegister}
                        loading={loading}
                        style={styles.registerButton}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <Button
                            title="Login"
                            onPress={() => navigation.navigate('Login')}
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
    registerButton: {
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

export default RegisterScreen;
