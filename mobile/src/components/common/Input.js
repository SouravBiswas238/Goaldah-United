import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import colors from '../../styles/colors';
import typography from '../../styles/typography';
import spacing from '../../styles/spacing';

const Input = ({
    label,
    value,
    onChangeText,
    placeholder,
    error,
    secureTextEntry = false,
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    multiline = false,
    numberOfLines = 1,
    style,
    ...props
}) => {
    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    multiline && styles.inputMultiline,
                    error && styles.inputError,
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.gray400}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                multiline={multiline}
                numberOfLines={numberOfLines}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.marginMd,
    },
    label: {
        fontSize: typography.sm,
        fontWeight: typography.medium,
        color: colors.gray700,
        marginBottom: spacing.marginXs,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.gray300,
        borderRadius: spacing.radiusMd,
        paddingHorizontal: spacing.paddingMd,
        paddingVertical: spacing.paddingSm + 4,
        fontSize: typography.base,
        color: colors.textPrimary,
        backgroundColor: colors.white,
    },
    inputMultiline: {
        minHeight: 80,
        textAlignVertical: 'top',
        paddingTop: spacing.paddingSm + 4,
    },
    inputError: {
        borderColor: colors.error,
    },
    errorText: {
        fontSize: typography.xs,
        color: colors.error,
        marginTop: spacing.marginXs,
    },
});

export default Input;
