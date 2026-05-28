import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, RefreshControl, Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';
import { apiRequest } from '@/lib/queryClient';
import { ListingBadge } from '@/components/ListingBadge';
import { timeAgo } from '@/utils/formatters';

type StatusFilter = 'ALL' | 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REMOVED' | 'REJECTED';
const STATUS_FILTERS: StatusFilter[] = ['ALL', 'PENDING', 'ACTIVE', 'EXPIRED', 'REMOVED', 'REJECTED'];

export default function ListingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['/api/listings/mine'],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/listings/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/listings/mine'] }),
  });

  const allListings: any[] = data?.listings ?? (Array.isArray(data) ? data : []);

  const listings = allListings.filter(l => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') {
      return l.status === 'ACTIVE' && new Date(l.endTime).getTime() > Date.now();
    }
    if (statusFilter === 'EXPIRED') {
      return l.status === 'EXPIRED' || (l.status === 'ACTIVE' && new Date(l.endTime).getTime() <= Date.now());
    }
    return l.status === statusFilter;
  });

  const confirmDelete = (id: string, title: string) => {
    Alert.alert('Remove Listing', `Remove "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>My Listings</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{allListings.length} total</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, statusFilter === f && { backgroundColor: colors.foreground }]}
            onPress={() => setStatusFilter(f)}
          >
            <Text style={[styles.filterTxt, { color: statusFilter === f ? colors.background : colors.mutedForeground }]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={listings}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={[styles.sep, { backgroundColor: colors.border }]} />}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: colors.card }]}>
            <View style={styles.rowContent}>
              <View style={styles.titleRow}>
                <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <ListingBadge status={item.status} />
              </View>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                {item.buildingName}{item.roomOrFloor ? ` · ${item.roomOrFloor}` : ''}
              </Text>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                {item.saveCount ?? 0} saves · {timeAgo(item.createdAt)}
              </Text>
              {item.status === 'REJECTED' && item.rejectionReason && (
                <Text style={styles.rejectedReason} numberOfLines={2}>
                  Reason: {item.rejectionReason}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => confirmDelete(item.id, item.title)}
            >
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="list-outline" size={52} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {statusFilter === 'ALL' ? 'No listings yet' : `No ${statusFilter.toLowerCase()} listings`}
              </Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                {statusFilter === 'ALL' ? 'Post your first free giveaway from the Post tab' : 'Try a different filter'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  title: { fontSize: 26, fontWeight: '700' },
  count: { fontSize: 14 },
  filterRow: { paddingHorizontal: 16, paddingBottom: 12, gap: 8, flexDirection: 'row' },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f3f4f6',
  },
  filterTxt: { fontSize: 12, fontWeight: '600' },
  list: { paddingBottom: 32 },
  sep: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  rowContent: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  itemTitle: { fontSize: 15, fontWeight: '600', flex: 1 },
  meta: { fontSize: 13 },
  rejectedReason: { fontSize: 12, color: '#dc2626', marginTop: 2 },
  deleteBtn: { padding: 8 },
  empty: { alignItems: 'center', paddingTop: 72, paddingHorizontal: 32, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  emptySub: { fontSize: 14, textAlign: 'center' },
});
