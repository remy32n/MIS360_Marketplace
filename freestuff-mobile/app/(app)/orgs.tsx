import React from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  RefreshControl, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { apiRequest } from '@/lib/queryClient';

export default function OrgsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['/api/orgs'],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest('PATCH', `/api/orgs/${id}/verify`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/orgs'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const orgs: any[] = data?.orgs ?? (Array.isArray(data) ? data : []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Organizations</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{orgs.length}</Text>
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
          const isVerified = item.verificationStatus === 'VERIFIED' || item.isVerified;
          return (
            <View style={[styles.row, { backgroundColor: colors.card }]}>
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
                <Text style={[styles.listings, { color: colors.mutedForeground }]}>
                  {item._count?.listings ?? item.listingCount ?? 0} listings
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.verifyBtn,
                  { backgroundColor: isVerified ? '#dcfce7' : colors.muted },
                ]}
                onPress={() => updateMutation.mutate({
                  id: item.id,
                  status: isVerified ? 'PENDING' : 'VERIFIED',
                })}
              >
                <Ionicons
                  name={isVerified ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={isVerified ? '#16a34a' : colors.mutedForeground}
                />
                <Text style={[styles.verifyTxt, { color: isVerified ? '#16a34a' : colors.mutedForeground }]}>
                  {isVerified ? 'Verified' : 'Verify'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Ionicons name="business-outline" size={52} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No organizations</Text>
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
  sep: { height: StyleSheet.hairlineWidth, marginLeft: 72 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1, gap: 2 },
  orgName: { fontSize: 15, fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold' },
  email: { fontSize: 13, fontFamily: 'DM_Sans_400Regular' },
  listings: { fontSize: 12, fontFamily: 'DM_Sans_400Regular' },
  verifyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
  },
  verifyTxt: { fontSize: 13, fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold' },
  empty: { alignItems: 'center', paddingTop: 72, paddingHorizontal: 32, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'DM_Sans_700Bold', marginTop: 8 },
});
