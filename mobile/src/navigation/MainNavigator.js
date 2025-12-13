import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import DashboardScreen from '../screens/main/DashboardScreen';
import { useAuth } from '../context/AuthContext';
import colors from '../styles/colors';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Placeholder screens - to be implemented
const PlaceholderScreen = ({ route }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{route.name} Screen</Text>
            <Text style={styles.subtext}>Coming soon...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.backgroundSecondary,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
    },
    subtext: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 8,
    },
});

const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.gray500,
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                },
            }}
        >
            <Tab.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
                }}
            />
            <Tab.Screen
                name="Finance"
                component={PlaceholderScreen}
                options={{
                    tabBarLabel: 'Finance',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>💰</Text>,
                }}
            />
            <Tab.Screen
                name="Events"
                component={PlaceholderScreen}
                options={{
                    tabBarLabel: 'Events',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📅</Text>,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={PlaceholderScreen}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>,
                }}
            />
        </Tab.Navigator>
    );
};

const AdminDrawerNavigator = () => {
    return (
        <Drawer.Navigator
            screenOptions={{
                drawerActiveTintColor: colors.primary,
                drawerInactiveTintColor: colors.gray600,
            }}
        >
            <Drawer.Screen
                name="Dashboard"
                component={DashboardScreen}
                options={{
                    drawerLabel: 'Dashboard',
                    drawerIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🏠</Text>,
                }}
            />
            <Drawer.Screen
                name="Finance"
                component={PlaceholderScreen}
                options={{
                    drawerLabel: 'Finance',
                    drawerIcon: ({ color }) => <Text style={{ fontSize: 20 }}>💰</Text>,
                }}
            />
            <Drawer.Screen
                name="Events"
                component={PlaceholderScreen}
                options={{
                    drawerLabel: 'Events',
                    drawerIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📅</Text>,
                }}
            />
            <Drawer.Screen
                name="Profile"
                component={PlaceholderScreen}
                options={{
                    drawerLabel: 'Profile',
                    drawerIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>,
                }}
            />
            <Drawer.Screen
                name="AdminDashboard"
                component={PlaceholderScreen}
                options={{
                    drawerLabel: 'Admin Dashboard',
                    drawerIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⚙️</Text>,
                }}
            />
            <Drawer.Screen
                name="ManageUsers"
                component={PlaceholderScreen}
                options={{
                    drawerLabel: 'Manage Users',
                    drawerIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👥</Text>,
                }}
            />
            <Drawer.Screen
                name="ManageEvents"
                component={PlaceholderScreen}
                options={{
                    drawerLabel: 'Manage Events',
                    drawerIcon: ({ color }) => <Text style={{ fontSize: 20 }}>📋</Text>,
                }}
            />
        </Drawer.Navigator>
    );
};

const MainNavigator = () => {
    const { isAdmin } = useAuth();

    return isAdmin ? <AdminDrawerNavigator /> : <MainTabNavigator />;
};

export default MainNavigator;
