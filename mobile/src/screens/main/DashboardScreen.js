import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import colors from '../../styles/colors';
import typography from '../../styles/typography';
import spacing from '../../styles/spacing';

const DashboardScreen = () => {
    const { user } = useAuth();
    const [summary, setSummary] = useState({
        totalFund: 0,
        totalExpenses: 0,
        currentBalance: 0,
    });
    const [myContributions, setMyContributions] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            const [summaryRes, contributionsRes, expensesRes] = await Promise.all([
                api.get('/finance/summary'),
                api.get('/finance/contributions/me'),
                api.get('/finance/expenses'),
            ]);

            setSummary(summaryRes.data);
            setMyContributions(contributionsRes.data);
            setExpenses(expensesRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, []);

    const myTotalContribution = myContributions.reduce(
        (sum, item) => sum + parseFloat(item.amount || 0),
        0
    );

    if (loading) {
        return <Loading fullScreen />;
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.header}>
                <Text style={styles.title}>Dashboard</Text>
                <Text style={styles.subtitle}>Welcome back, {user?.name}</Text>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsGrid}>
                <Card style={styles.statCard}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.infoLight }]}>
                        <Text style={styles.iconText}>৳</Text>
                    </View>
                    <Text style={styles.statLabel}>My Contribution</Text>
                    <Text style={styles.statValue}>৳{myTotalContribution.toLocaleString()}</Text>
                    <Text style={styles.statSubtext}>Total contributed</Text>
                </Card>

                <Card style={styles.statCard}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.successLight }]}>
                        <Text style={styles.iconText}>💰</Text>
                    </View>
                    <Text style={styles.statLabel}>Village Fund</Text>
                    <Text style={styles.statValue}>৳{summary.totalFund.toLocaleString()}</Text>
                    <Text style={styles.statSubtext}>Total collected</Text>
                </Card>

                <Card style={styles.statCard}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.errorLight }]}>
                        <Text style={styles.iconText}>📉</Text>
                    </View>
                    <Text style={styles.statLabel}>Total Expenses</Text>
                    <Text style={styles.statValue}>৳{summary.totalExpenses.toLocaleString()}</Text>
                    <Text style={styles.statSubtext}>Total spent</Text>
                </Card>

                <Card style={styles.statCard}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.warningLight }]}>
                        <Text style={styles.iconText}>📊</Text>
                    </View>
                    <Text style={styles.statLabel}>Current Balance</Text>
                    <Text style={styles.statValue}>৳{summary.currentBalance.toLocaleString()}</Text>
                    <Text style={styles.statSubtext}>Available fund</Text>
                </Card>
            </View>

            {/* Recent Contributions */}
            <Card style={styles.section}>
                <Text style={styles.sectionTitle}>My Recent Contributions</Text>
                {myContributions.slice(0, 5).map((item) => (
                    <View key={item.id} style={styles.listItem}>
                        <View style={styles.listItemLeft}>
                            <Text style={styles.listItemDate}>
                                {new Date(item.date).toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={styles.listItemRight}>
                            <Text style={styles.listItemAmount}>৳{item.amount}</Text>
                            <View
                                style={[
                                    styles.statusBadge,
                                    item.status === 'approved'
                                        ? styles.statusApproved
                                        : styles.statusPending,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.statusText,
                                        item.status === 'approved'
                                            ? styles.statusTextApproved
                                            : styles.statusTextPending,
                                    ]}
                                >
                                    {item.status}
                                </Text>
                            </View>
                        </View>
                    </View>
                ))}
                {myContributions.length === 0 && (
                    <Text style={styles.emptyText}>No contributions yet.</Text>
                )}
            </Card>

            {/* Recent Expenses */}
            <Card style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Village Expenses</Text>
                {expenses.slice(0, 5).map((item) => (
                    <View key={item.id} style={styles.listItem}>
                        <View style={styles.listItemLeft}>
                            <Text style={styles.listItemDate}>
                                {new Date(item.date).toLocaleDateString()}
                            </Text>
                            <Text style={styles.listItemPurpose}>{item.purpose}</Text>
                        </View>
                        <Text style={styles.listItemExpense}>-৳{item.amount}</Text>
                    </View>
                ))}
                {expenses.length === 0 && (
                    <Text style={styles.emptyText}>No expenses recorded yet.</Text>
                )}
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.backgroundSecondary,
    },
    header: {
        padding: spacing.paddingLg,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: typography['2xl'],
        fontWeight: typography.bold,
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: typography.sm,
        color: colors.textSecondary,
        marginTop: spacing.marginXs,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: spacing.paddingSm,
    },
    statCard: {
        width: '48%',
        margin: '1%',
        padding: spacing.paddingMd,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: spacing.radiusMd,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.marginSm,
    },
    iconText: {
        fontSize: typography.lg,
    },
    statLabel: {
        fontSize: typography.xs,
        color: colors.textSecondary,
        marginBottom: spacing.marginXs,
    },
    statValue: {
        fontSize: typography.xl,
        fontWeight: typography.bold,
        color: colors.textPrimary,
    },
    statSubtext: {
        fontSize: typography.xs,
        color: colors.textLight,
        marginTop: spacing.marginXs,
    },
    section: {
        margin: spacing.marginMd,
    },
    sectionTitle: {
        fontSize: typography.lg,
        fontWeight: typography.bold,
        color: colors.textPrimary,
        marginBottom: spacing.marginMd,
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.paddingSm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    listItemLeft: {
        flex: 1,
    },
    listItemRight: {
        alignItems: 'flex-end',
    },
    listItemDate: {
        fontSize: typography.sm,
        color: colors.textSecondary,
    },
    listItemPurpose: {
        fontSize: typography.sm,
        color: colors.textPrimary,
        marginTop: 2,
    },
    listItemAmount: {
        fontSize: typography.base,
        fontWeight: typography.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.marginXs,
    },
    listItemExpense: {
        fontSize: typography.base,
        fontWeight: typography.semibold,
        color: colors.error,
    },
    statusBadge: {
        paddingHorizontal: spacing.paddingSm,
        paddingVertical: 2,
        borderRadius: spacing.radiusSm,
    },
    statusApproved: {
        backgroundColor: colors.successLight,
    },
    statusPending: {
        backgroundColor: colors.warningLight,
    },
    statusText: {
        fontSize: typography.xs,
        fontWeight: typography.semibold,
        textTransform: 'capitalize',
    },
    statusTextApproved: {
        color: colors.successDark,
    },
    statusTextPending: {
        color: colors.warningDark,
    },
    emptyText: {
        fontSize: typography.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingVertical: spacing.paddingLg,
    },
});

export default DashboardScreen;
