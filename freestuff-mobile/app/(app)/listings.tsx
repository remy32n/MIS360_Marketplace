import React from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, RefreshControl, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { apiRequest } from '@/lib/queryClient';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#22c55e',
  PENDING: '#f59e0b',
  REJECTED: '#ef4444',
  EXPIRED: '#9ca3af',
};

export default function ListingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['/api/listings/mine'],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/listings/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/listings/mine'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const listings: any[] = data?.listings ?? (Array.isArray(data) ? data : []);

  const confirmDelete = (id: string, title: string) => {
    Alert.alert('Delete Listing', `Remove "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>My Listings</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>
          {listings.length} total
        </Text>
      </View>

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
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '22' }]}>
                  <Text style={[styles.statusTxt, { color: STATUS_COLORS[item.status] }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                {item.buildingName}{item.roomOrFloor ? ` · ${item.roomOrFloor}` : ''}
              </Text>
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                {item.saveCount ?? 0} saves · ends {new Date(item.endTime).toLocaleDateString()}
              </Text>
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
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No listings yet</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                Post your first free giveaway from the Post tab
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
  title: { fontSize: 26, fontWeight: '700', fontFamily: 'DM_Sans_700Bold' },
  count: { fontSize: 14, fontFamily: 'DM_Sans_400Regular' },
  list: { paddingBottom: 32 },
  sep: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  rowContent: { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  itemTitle: { fontSize: 15, fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusTxt: { fontSize: 11, fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold' },
  meta: { fontSize: 13, fontFamily: 'DM_Sans_400Regular' },
  deleteBtn: { padding: 8 },
  empty: { alignItems: 'center', paddingTop: 72, paddingHorizontal: 32, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'DM_Sans_700Bold', marginTop: 8 },
  emptySub: { fontSize: 14, fontFamily: 'DM_Sans_400Regular', textAlign: 'center' },
});
