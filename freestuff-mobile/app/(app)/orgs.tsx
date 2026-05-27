import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';
import { apiRequest } from '@/lib/queryClient';

type VerifyFilter = 'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED';
const FILTERS: VerifyFilter[] = ['ALL', 'PENDING', 'VERIFIED', 'REJECTED'];

const STATUS_COLORS: Record<string, string> = {
  VERIFIED: '#16a34a',
  PENDING: '#d97706',
  REJECTED: '#dc2626',
};

export default function OrgsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const [filter, setFilter] = useState<VerifyFilter>('ALL');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['/api/orgs'],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest('PATCH', `/api/orgs/${id}/verify`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['/api/orgs'] }),
  });

  const allOrgs: any[] = data?.orgs ?? (Array.isArray(data) ? data : []);
  const orgs = allOrgs.filter(o => {
    if (filter === 'ALL') return true;
    return o.verificationStatus === filter || (filter === 'VERIFIED' && o.isVerified);
  });

  const handleVerify = (org: any) => {
    const current = org.verificationStatus ?? (org.isVerified ? 'VERIFIED' : 'PENDING');
    if (current === 'VERIFIED') {
      Alert.alert('Revoke Verification', `Revoke verification for ${org.orgName}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Revoke', style: 'destructive', onPress: () => updateMutation.mutate({ id: org.id, status: 'PENDING' }) },
      ]);
    } else {
      updateMutation.mutate({ id: org.id, status: 'VERIFIED' });
    }
  };

  const handleReject = (org: any) => {
    Alert.alert('Reject Organization', `Reject ${org.orgName}? They will not be able to post listings.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: () => updateMutation.mutate({ id: org.id, status: 'REJECTED' }) },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Organizations</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{allOrgs.length}</Text>
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

      <FlatList
        data={orgs}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={[styles.sep, { backgroundColor: colors.border }]} />}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        renderItem={({ item }) => {
          const status: string = item.verificationStatus ?? (item.isVerified ? 'VERIFIED' : 'PENDING');
          const statusColor = STATUS_COLORS[status] ?? colors.mutedForeground;
          const isVerified = status === 'VERIFIED';
          const isPending = status === 'PENDING';

          return (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: colors.muted }]}>
                  <Ionicons name="business-outline" size={22} color={colors.mutedForeground} />
                </View>
                <View style={styles.info}>
                  <Text style={[styles.orgName, { color: colors.foreground }]} numberOfLines={1}>
                    {item.orgName}
                  </Text>
                  <Text style={[styles.email, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {item.contactEmail ?? item.user?.email ?? ''}
                  </Text>
                  <View style={styles.statsRow}>
                    <Text style={[styles.statsText, { color: colors.mutedForeground }]}>
                      {item._count?.listings ?? item.listingCount ?? 0} listings
                    </Text>
                    <View style={[styles.statusPill, { backgroundColor: statusColor + '20' }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.cardActions}>
                {isPending && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#fee2e2' }]}
                    onPress={() => handleReject(item)}
                  >
                    <Ionicons name="close-outline" size={16} color="#dc2626" />
                    <Text style={[styles.actionTxt, { color: '#dc2626' }]}>Reject</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: isVerified ? '#f3f4f6' : '#dcfce7', flex: isPending ? 1 : undefined },
                  ]}
                  onPress={() => handleVerify(item)}
                >
                  <Ionicons
                    name={isVerified ? 'close-circle-outline' : 'checkmark-circle-outline'}
                    size={16}
                    color={isVerified ? colors.mutedForeground : '#16a34a'}
                  />
                  <Text style={[styles.actionTxt, { color: isVerified ? colors.mutedForeground : '#16a34a' }]}>
                    {isVerified ? 'Revoke' : 'Verify'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="business-outline" size={52} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {filter === 'ALL' ? 'No organizations' : `No ${filter.toLowerCase()} organizations`}
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
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f3f4f6',
  },
  filterTxt: { fontSize: 12, fontWeight: '600' },
  list: { paddingBottom: 32 },
  sep: { height: StyleSheet.hairlineWidth },
  card: { paddingHorizontal: 16, paddingVertical: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 2 },
  orgName: { fontSize: 15, fontWeight: '600' },
  email: { fontSize: 13 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  statsText: { fontSize: 12 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 9, borderRadius: 10,
  },
  actionTxt: { fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 72, paddingHorizontal: 32, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 8 },
});
