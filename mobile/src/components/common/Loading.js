import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '../../styles/colors';

const Loading = ({ fullScreen = false, color = colors.primary, size = 'large' }) => {
    if (fullScreen) {
        return (
            <View style={styles.fullScreen}>
                <ActivityIndicator size={size} color={color} />
            </View>
        );
    }

    return <ActivityIndicator size={size} color={color} />;
};

const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
});

export default Loading;
