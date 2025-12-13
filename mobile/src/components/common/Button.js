import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import colors from '../../styles/colors';
import typography from '../../styles/typography';
import spacing from '../../styles/spacing';

const Button = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle,
}) => {
    const getButtonStyle = () => {
        if (disabled || loading) {
            return [styles.button, styles.buttonDisabled, style];
        }

        switch (variant) {
            case 'secondary':
                return [styles.button, styles.buttonSecondary, style];
            case 'danger':
                return [styles.button, styles.buttonDanger, style];
            case 'outline':
                return [styles.button, styles.buttonOutline, style];
            default:
                return [styles.button, styles.buttonPrimary, style];
        }
    };

    const getTextStyle = () => {
        if (variant === 'outline') {
            return [styles.buttonText, styles.buttonTextOutline, textStyle];
        }
        return [styles.buttonText, textStyle];
    };

    return (
        <TouchableOpacity
            style={getButtonStyle()}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.white} />
            ) : (
                <Text style={getTextStyle()}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: spacing.paddingMd,
        paddingHorizontal: spacing.paddingLg,
        borderRadius: spacing.radiusMd,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    buttonPrimary: {
        backgroundColor: colors.primary,
    },
    buttonSecondary: {
        backgroundColor: colors.secondary,
    },
    buttonDanger: {
        backgroundColor: colors.error,
    },
    buttonOutline: {
        backgroundColor: colors.transparent,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    buttonDisabled: {
        backgroundColor: colors.gray300,
    },
    buttonText: {
        color: colors.white,
        fontSize: typography.base,
        fontWeight: typography.semibold,
    },
    buttonTextOutline: {
        color: colors.primary,
    },
});

export default Button;
