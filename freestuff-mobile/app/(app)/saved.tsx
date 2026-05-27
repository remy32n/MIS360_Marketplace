import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';
import { ListingCard } from '@/components/ListingCard';
import { ListingCardSkeleton } from '@/components/ListingCardSkeleton';

type Filter = 'ALL' | 'ACTIVE' | 'EXPIRED';
const FILTERS: Filter[] = ['ALL', 'ACTIVE', 'EXPIRED'];

export default function SavedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const [filter, setFilter] = useState<Filter>('ALL');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['/api/engagement/saved'],
  });

  const saved: any[] = data?.saved ?? data?.listings ?? (Array.isArray(data) ? data : []);

  const listings = saved
    .map((s: any) => ({
      ...(s.listing ?? s),
      savedId: s.id ?? s.savedId ?? s.listing?.savedId,
      isSaved: true,
    }))
    .filter((l: any) => {
      if (filter === 'ALL') return true;
      const isExpired = new Date(l.endTime).getTime() <= Date.now();
      const isActive = l.status === 'ACTIVE' && !isExpired;
      if (filter === 'ACTIVE') return isActive;
      if (filter === 'EXPIRED') return !isActive;
      return true;
    });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Saved</Text>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && { backgroundColor: colors.foreground }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTxt, { color: filter === f ? colors.background : colors.mutedForeground }]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.skeletons}>
          {[0, 1].map(k => <ListingCardSkeleton key={k} />)}
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
          renderItem={({ item }) => <ListingCard listing={item} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="bookmark-outline" size={52} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {filter === 'ALL' ? 'No saved listings' : `No ${filter.toLowerCase()} listings`}
              </Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                {filter === 'ALL' ? 'Tap the heart on any listing to save it here' : 'Try a different filter'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '700' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterBtn: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f3f4f6',
  },
  filterTxt: { fontSize: 13, fontWeight: '600' },
  list: { paddingBottom: 32, paddingTop: 4 },
  skeletons: { gap: 16 },
  empty: { alignItems: 'center', paddingTop: 72, paddingHorizontal: 32, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  emptySub: { fontSize: 14, textAlign: 'center' },
});
