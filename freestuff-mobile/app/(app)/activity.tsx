import React from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';

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

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['/api/engagement/stats'],
  });

  const stats = data ?? {};

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Activity</Text>
      </View>

      <FlatList
        data={[]}
        keyExtractor={() => 'placeholder'}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View style={styles.grid}>
            <StatCard label="Total Listings" value={stats.totalListings} icon="document-text-outline" color="#0095f6" />
            <StatCard label="Active Now" value={stats.activeListings} icon="flash-outline" color="#22c55e" />
            <StatCard label="Total Saves" value={stats.totalSaves} icon="bookmark-outline" color="#f59e0b" />
            <StatCard label="Organizations" value={stats.totalOrgs} icon="business-outline" color="#8b5cf6" />
            <StatCard label="Students" value={stats.totalStudents} icon="school-outline" color="#ec4899" />
            <StatCard label="Pending Review" value={stats.pendingListings} icon="time-outline" color="#ef4444" />
          </View>
        }
        renderItem={() => null}
        ListEmptyComponent={null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', fontFamily: 'DM_Sans_700Bold' },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '47%', borderRadius: 16, padding: 16, gap: 8,
    alignItems: 'flex-start',
  },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 26, fontWeight: '700', fontFamily: 'DM_Sans_700Bold' },
  statLabel: { fontSize: 13, fontFamily: 'DM_Sans_400Regular' },
});
