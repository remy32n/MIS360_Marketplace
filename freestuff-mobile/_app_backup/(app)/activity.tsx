import React from 'react';
import {
  View, Text, FlatList, StyleSheet, RefreshControl, Platform, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { ListingBadge } from '@/components/ListingBadge';
import { timeAgo } from '@/utils/formatters';
import { apiRequest } from '@/lib/queryClient';

function StatCard({ label, value, icon, color }: { label: string; value: any; icon: any; color: string }) {
  const colors = useColors();
  return (
    <View style={[styles.statCard, { backgroundColor: color + '18' }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '30' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value ?? '—'}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

export default function ActivityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  const { data: statsData, isLoading: statsLoading, refetch: refetchStats, isRefetching: statsRefetching } = useQuery({
    queryKey: ['/api/engagement/stats'],
  });

  const { data: listingsData, isLoading: listingsLoading, refetch: refetchListings, isRefetching: listingsRefetching } = useQuery({
    queryKey: ['/api/listings/admin/all'],
    queryFn: () => apiRequest('GET', '/api/listings/admin/all'),
  });

  const stats = statsData ?? {};
  const recentListings: any[] = (listingsData?.listings ?? (Array.isArray(listingsData) ? listingsData : [])).slice(0, 20);

  const isRefreshing = statsRefetching || listingsRefetching;
  const onRefresh = () => { refetchStats(); refetchListings(); };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Activity</Text>
      </View>

      <FlatList
        data={recentListings}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <>
            <View style={styles.grid}>
              <StatCard label="Total Listings" value={stats.totalListings} icon="document-text-outline" color="#0095f6" />
              <StatCard label="Active Now" value={stats.activeListings} icon="flash-outline" color="#22c55e" />
              <StatCard label="Total Saves" value={stats.totalSaves} icon="bookmark-outline" color="#f59e0b" />
              <StatCard label="Organizations" value={stats.totalOrgs} icon="business-outline" color="#8b5cf6" />
              <StatCard label="Students" value={stats.totalStudents} icon="school-outline" color="#ec4899" />
              <StatCard label="Pending Review" value={stats.pendingListings} icon="time-outline" color="#ef4444" />
            </View>

            {recentListings.length > 0 && (
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All Listings</Text>
            )}
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.listingRow, { borderBottomColor: colors.border }]}
            onPress={() => router.push(`/listing/${item.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.listingInfo}>
              <Text style={[styles.listingTitle, { color: colors.foreground }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.listingMeta, { color: colors.mutedForeground }]} numberOfLines={1}>
                {item.postedByOrg?.orgName ?? 'Unknown org'} · {timeAgo(item.createdAt)}
              </Text>
            </View>
            <ListingBadge status={item.status} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !listingsLoading ? (
            <View style={styles.empty}>
              <Ionicons name="pulse-outline" size={40} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No listings yet</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '700' },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { width: '47%', borderRadius: 16, padding: 16, gap: 8, alignItems: 'flex-start' },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 26, fontWeight: '700' },
  statLabel: { fontSize: 13 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  listingRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth, gap: 12,
  },
  listingInfo: { flex: 1 },
  listingTitle: { fontSize: 14, fontWeight: '600' },
  listingMeta: { fontSize: 12, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: 40, gap: 8 },
  emptyText: { fontSize: 14 },
});
