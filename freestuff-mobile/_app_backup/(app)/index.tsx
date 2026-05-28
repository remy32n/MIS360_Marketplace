import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput,
  TouchableOpacity, RefreshControl, Platform, Modal, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/hooks/useAuth';
import { ListingCard } from '@/components/ListingCard';
import { ListingCardSkeleton } from '@/components/ListingCardSkeleton';
import { apiRequest } from '@/lib/queryClient';
import { timeAgo } from '@/utils/formatters';
import { ListingBadge } from '@/components/ListingBadge';

const CATEGORIES = ['ALL', 'FOOD', 'DRINKS', 'APPAREL', 'SUPPLIES', 'OTHER'];
const CATEGORY_EMOJI: Record<string, string> = {
  ALL: '✨', FOOD: '🍕', DRINKS: '🥤', APPAREL: '👕', SUPPLIES: '📚', OTHER: '🎁',
};

function BrowseFeed() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isOrg, user } = useAuth();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('ALL');
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  const queryParams: any = { sort: 'recent' };
  if (search) queryParams.search = search;
  if (cat !== 'ALL') queryParams.category = cat;

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: [`/api/listings-browse-${cat}-${search}`],
    queryFn: () => apiRequest('GET', '/api/listings', queryParams),
    refetchInterval: 60000,
  });

  const listings: any[] = data?.listings ?? (Array.isArray(data) ? data : []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.browseHeader, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Free Stuff</Text>
        <Ionicons name="gift-outline" size={22} color={colors.primary} />
      </View>

      {isOrg && !user?.isVerified && (
        <View style={[styles.verifyBanner, { backgroundColor: '#fef9c3' }]}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#854d0e" />
          <Text style={[styles.verifyBannerTxt, { color: '#854d0e' }]}>
            Your organization is pending verification. You cannot post listings yet.
          </Text>
        </View>
      )}

      <View style={[styles.searchBar, { backgroundColor: colors.muted }]}>
        <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search listings..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {search.length > 0 && Platform.OS !== 'ios' && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={i => i}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pills}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.pill, item === cat && { backgroundColor: colors.foreground }]}
            onPress={() => setCat(item)}
          >
            <Text style={{ fontSize: 13 }}>{CATEGORY_EMOJI[item]}</Text>
            <Text style={[styles.pillTxt, { color: item === cat ? colors.background : colors.mutedForeground }]}>
              {item === 'ALL' ? 'All' : item.charAt(0) + item.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        )}
      />

      {isLoading ? (
        <View style={styles.skeletons}>
          {[0, 1, 2].map(k => <ListingCardSkeleton key={k} />)}
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
          renderItem={({ item }) => (
            <View style={styles.cardWrapper}>
              <ListingCard listing={item} />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>🔍</Text>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {search ? 'No results' : 'Nothing here yet'}
              </Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                {search ? 'Try a different search or category' : 'Check back soon for free stuff!'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function ApprovalQueue() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const [selected, setSelected] = useState<any>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['/api/listings/admin/pending'],
    queryFn: () => apiRequest('GET', '/api/listings/admin/pending'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      apiRequest('PATCH', `/api/listings/${id}/status`, { status, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/listings/admin/pending'] });
      qc.invalidateQueries({ queryKey: ['/api/listings/admin/all'] });
      setRejectModalVisible(false);
      setRejectReason('');
      setSelected(null);
    },
    onError: () => { /* silently fail, user can retry */ },
  });

  const listings: any[] = data?.listings ?? (Array.isArray(data) ? data : []);

  const openReject = (item: any) => {
    setSelected(item);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.browseHeader, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Approval Queue</Text>
        {listings.length > 0 && (
          <View style={[styles.badge, { backgroundColor: '#ef4444' }]}>
            <Text style={styles.badgeTxt}>{listings.length}</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.skeletons}>
          {[0, 1].map(k => <ListingCardSkeleton key={k} />)}
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={i => i.id}
          contentContainerStyle={[styles.list, { paddingHorizontal: 0 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
          renderItem={({ item }) => (
            <View style={[styles.pendingCard, { borderBottomColor: colors.border }]}>
              <View style={styles.pendingCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.pendingTitle, { color: colors.foreground }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={[styles.pendingMeta, { color: colors.mutedForeground }]}>
                    {item.postedByOrg?.orgName ?? 'Unknown org'} · {item.category} · {timeAgo(item.createdAt)}
                  </Text>
                  <Text style={[styles.pendingLocation, { color: colors.mutedForeground }]}>
                    📍 {item.buildingName}{item.roomOrFloor ? `, ${item.roomOrFloor}` : ''}
                  </Text>
                  {item.description ? (
                    <Text style={[styles.pendingDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}
                </View>
                <ListingBadge status={item.status} />
              </View>
              <View style={styles.pendingActions}>
                <TouchableOpacity
                  style={[styles.pendingBtn, { backgroundColor: '#fee2e2' }]}
                  onPress={() => openReject(item)}
                  disabled={statusMutation.isPending}
                >
                  <Ionicons name="close-outline" size={18} color="#dc2626" />
                  <Text style={[styles.pendingBtnTxt, { color: '#dc2626' }]}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pendingBtn, { backgroundColor: '#dcfce7' }]}
                  onPress={() => statusMutation.mutate({ id: item.id, status: 'ACTIVE' })}
                  disabled={statusMutation.isPending}
                >
                  {statusMutation.isPending && selected?.id === item.id
                    ? <ActivityIndicator size="small" color="#16a34a" />
                    : <Ionicons name="checkmark-outline" size={18} color="#16a34a" />
                  }
                  <Text style={[styles.pendingBtnTxt, { color: '#16a34a' }]}>Approve</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>✅</Text>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>All clear!</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                No listings pending review
              </Text>
            </View>
          }
        />
      )}

      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Reject Listing</Text>
            <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
              "{selected?.title}"
            </Text>
            <Text style={[styles.modalLabel, { color: colors.mutedForeground }]}>
              Reason (optional)
            </Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.muted, color: colors.foreground }]}
              placeholder="e.g. Insufficient information provided"
              placeholderTextColor={colors.mutedForeground}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.muted }]}
                onPress={() => setRejectModalVisible(false)}
              >
                <Text style={[styles.modalBtnTxt, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#fee2e2' }]}
                onPress={() => selected && statusMutation.mutate({
                  id: selected.id,
                  status: 'REJECTED',
                  reason: rejectReason || undefined,
                })}
                disabled={statusMutation.isPending}
              >
                {statusMutation.isPending
                  ? <ActivityIndicator size="small" color="#dc2626" />
                  : <Text style={[styles.modalBtnTxt, { color: '#dc2626' }]}>Reject</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function IndexScreen() {
  const { isAdmin } = useAuth();
  return isAdmin ? <ApprovalQueue /> : <BrowseFeed />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  browseHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  headerTitle: { fontSize: 26, fontWeight: '700' },
  verifyBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 8, padding: 10, borderRadius: 10,
  },
  verifyBannerTxt: { fontSize: 13, flex: 1, lineHeight: 18 },
  searchBar: {
    marginHorizontal: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, paddingHorizontal: 12, height: 44, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  pills: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f3f4f6',
  },
  pillTxt: { fontSize: 13, fontWeight: '600' },
  list: { paddingBottom: 32, paddingHorizontal: 8, paddingTop: 4 },
  columnWrapper: { gap: 8, paddingHorizontal: 8 },
  cardWrapper: { flex: 1 },
  skeletons: { gap: 16, paddingTop: 4 },
  empty: { alignItems: 'center', paddingTop: 72, paddingHorizontal: 32, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  emptySub: { fontSize: 14, textAlign: 'center' },
  badge: { borderRadius: 12, minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  pendingCard: {
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth, gap: 12,
  },
  pendingCardHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  pendingTitle: { fontSize: 15, fontWeight: '600', lineHeight: 20, marginBottom: 3 },
  pendingMeta: { fontSize: 12, marginBottom: 2 },
  pendingLocation: { fontSize: 12, marginBottom: 2 },
  pendingDesc: { fontSize: 12, lineHeight: 16, marginTop: 3 },
  pendingActions: { flexDirection: 'row', gap: 10 },
  pendingBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 10, borderRadius: 10,
  },
  pendingBtnTxt: { fontSize: 14, fontWeight: '600' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  modalBox: { width: '100%', maxWidth: 400, borderRadius: 20, padding: 24, gap: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalSub: { fontSize: 14, marginTop: -4, fontStyle: 'italic' },
  modalLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  modalInput: { borderRadius: 12, padding: 12, fontSize: 14, height: 80 },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12 },
  modalBtnTxt: { fontSize: 14, fontWeight: '600' },
});
