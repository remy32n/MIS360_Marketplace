import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  RefreshControl, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { engagementAPI, listingsAPI } from '../../services/api';
import { COLORS, FONTS, SPACING, RADIUS, CARD_STYLE } from '../../constants/theme';
import { getCategoryInfo, getStatusInfo, timeAgo } from '../../utils/formatters';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import Toast from 'react-native-toast-message';

export default function ActivityDashboardScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    setError('');
    try {
      const data = await engagementAPI.getStats();
      setStats(data);
    } catch (e) {
      setError('Unable to load stats. Pull to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const handleQuickAction = async (listingId, status) => {
    try {
      await listingsAPI.updateStatus(listingId, status);
      Toast.show({ type: 'success', text1: `Listing ${status === 'APPROVED' ? 'approved' : 'rejected'}.` });
      fetchStats();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Action failed.' });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.brand[600]} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.center}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.brand[600]} />}
        >
          <Text style={styles.errorText}>{error}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const maxCat = Math.max(...Object.values(stats?.listingsByCategory || { OTHER: 1 }));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity Dashboard</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.brand[600]} />}
      >
        {stats?.pendingOrgs > 0 && (
          <View style={styles.pendingOrgBanner}>
            <Text style={styles.pendingOrgText}>
              ⚠️ {stats.pendingOrgs} org account{stats.pendingOrgs !== 1 ? 's' : ''} awaiting verification
            </Text>
          </View>
        )}

        <View style={styles.statsGrid}>
          <StatsCard
            label="Active Listings"
            value={stats?.totalActiveListings ?? 0}
            icon="list-outline"
            color={COLORS.brand[600]}
          />
          <StatsCard
            label="Pending Review"
            value={stats?.totalPendingListings ?? 0}
            icon="time-outline"
            color={COLORS.warning}
          />
          <StatsCard
            label="Total Users"
            value={stats?.totalUsers?.total ?? 0}
            icon="people-outline"
            color={COLORS.depaul.blue}
          />
          <StatsCard
            label="Total Saves"
            value={stats?.totalSaves ?? 0}
            icon="bookmark-outline"
            color="#7c3aed"
          />
        </View>

        <View style={styles.userBreakdown}>
          <Text style={styles.breakdownText}>
            Students: {stats?.totalUsers?.students ?? 0} · Orgs: {stats?.totalUsers?.orgs ?? 0} · Admins: {stats?.totalUsers?.admins ?? 0}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listings by Category</Text>
          {Object.entries(stats?.listingsByCategory || {}).map(([cat, count]) => {
            const info = getCategoryInfo(cat);
            const pct = maxCat > 0 ? (count / maxCat) * 100 : 0;
            return (
              <View key={cat} style={styles.barRow}>
                <Text style={styles.barLabel}>{info.emoji} {info.label}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: info.bg }]} />
                </View>
                <Text style={styles.barCount}>{count}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Listings (all statuses)</Text>
          {(stats?.recentListings || []).map(listing => {
            const cat = getCategoryInfo(listing.category);
            return (
              <View key={listing.id} style={styles.recentRow}>
                <Text style={styles.recentEmoji}>{cat.emoji}</Text>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentTitle} numberOfLines={1}>{listing.title}</Text>
                  <Text style={styles.recentMeta}>{listing.postedByOrg?.orgName || '—'} · {timeAgo(listing.createdAt)}</Text>
                </View>
                <StatusBadge status={listing.status} />
                {listing.status === 'PENDING' && (
                  <View style={styles.quickActions}>
                    <TouchableOpacity
                      style={styles.quickApprove}
                      onPress={() => handleQuickAction(listing.id, 'APPROVED')}
                    >
                      <Text style={styles.quickApproveText}>✓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickReject}
                      onPress={() => handleQuickAction(listing.id, 'REJECTED')}
                    >
                      <Text style={styles.quickRejectText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg.secondary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  header: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.gray[900] },
  content: { padding: SPACING.base, paddingBottom: SPACING['2xl'] },
  pendingOrgBanner: {
    backgroundColor: '#fef9c3',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.base,
  },
  pendingOrgText: { fontSize: FONTS.sizes.sm, color: '#854d0e', fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -SPACING.xs, marginBottom: SPACING.sm },
  userBreakdown: { paddingHorizontal: SPACING.xs, marginBottom: SPACING.base },
  breakdownText: { fontSize: FONTS.sizes.sm, color: COLORS.gray[400] },
  section: { ...CARD_STYLE, marginBottom: SPACING.base },
  sectionTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    color: COLORS.gray[800],
    marginBottom: SPACING.md,
  },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, gap: SPACING.sm },
  barLabel: { fontSize: FONTS.sizes.sm, color: COLORS.gray[600], width: 80 },
  barTrack: {
    flex: 1,
    height: 16,
    backgroundColor: COLORS.gray[100],
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: RADIUS.full, minWidth: 4 },
  barCount: { fontSize: FONTS.sizes.sm, color: COLORS.gray[600], width: 24, textAlign: 'right' },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    gap: SPACING.sm,
  },
  recentEmoji: { fontSize: 20 },
  recentInfo: { flex: 1 },
  recentTitle: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.gray[800] },
  recentMeta: { fontSize: FONTS.sizes.xs, color: COLORS.gray[400], marginTop: 2 },
  quickActions: { flexDirection: 'row', gap: SPACING.xs },
  quickApprove: {
    width: 28, height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.brand[600],
    justifyContent: 'center', alignItems: 'center',
  },
  quickApproveText: { color: COLORS.white, fontWeight: '800', fontSize: FONTS.sizes.sm },
  quickReject: {
    width: 28, height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    justifyContent: 'center', alignItems: 'center',
  },
  quickRejectText: { color: COLORS.error, fontWeight: '800', fontSize: FONTS.sizes.sm },
  errorText: { color: COLORS.gray[500], fontSize: FONTS.sizes.base, textAlign: 'center' },
});
