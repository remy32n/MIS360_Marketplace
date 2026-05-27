import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput,
  TouchableOpacity, RefreshControl, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/hooks/useAuth';
import { ListingCard } from '@/components/ListingCard';
import { ListingCardSkeleton } from '@/components/ListingCardSkeleton';
import { apiRequest } from '@/lib/queryClient';

const CATS = [
  { id: 'ALL', label: 'All', icon: 'apps-outline' as const },
  { id: 'FOOD', label: 'Food', icon: 'pizza-outline' as const },
  { id: 'DRINKS', label: 'Drinks', icon: 'cafe-outline' as const },
  { id: 'APPAREL', label: 'Merch', icon: 'shirt-outline' as const },
  { id: 'SUPPLIES', label: 'Supplies', icon: 'book-outline' as const },
  { id: 'OTHER', label: 'Other', icon: 'gift-outline' as const },
];

function BrowseFeed() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('ALL');
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  const params = new URLSearchParams({ sort: 'recent' });
  if (search) params.set('search', search);
  if (cat !== 'ALL') params.set('category', cat);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: [`/api/listings?${params}`],
    queryFn: () => apiRequest('GET', `/api/listings?${params}`),
  });

  const listings: any[] = data?.listings ?? (Array.isArray(data) ? data : []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Free Stuff</Text>
        <Ionicons name="gift-outline" size={22} color={colors.primary} />
      </View>

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
      </View>

      <FlatList
        horizontal
        data={CATS}
        keyExtractor={i => i.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pills}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.pill, item.id === cat && { backgroundColor: colors.foreground }]}
            onPress={() => { setCat(item.id); Haptics.selectionAsync(); }}
          >
            <Ionicons
              name={item.icon}
              size={13}
              color={item.id === cat ? colors.background : colors.mutedForeground}
            />
            <Text style={[styles.pillTxt, { color: item.id === cat ? colors.background : colors.mutedForeground }]}>
              {item.label}
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
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
          renderItem={({ item }) => <ListingCard listing={item} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={52} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nothing here</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                Try a different category or check back soon
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

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['/api/listings/admin/pending'],
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest('PATCH', `/api/listings/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/api/listings/admin/pending'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const listings: any[] = data?.listings ?? (Array.isArray(data) ? data : []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Approval Queue</Text>
        {listings.length > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.danger }]}>
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
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
          renderItem={({ item }) => (
            <View>
              <ListingCard listing={{ ...item, status: 'PENDING' }} showSaveButton={false} />
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#fee2e2' }]}
                  onPress={() => updateStatus.mutate({ id: item.id, status: 'REJECTED' })}
                >
                  <Ionicons name="close-outline" size={18} color="#ef4444" />
                  <Text style={[styles.actionTxt, { color: '#ef4444' }]}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#dcfce7' }]}
                  onPress={() => updateStatus.mutate({ id: item.id, status: 'ACTIVE' })}
                >
                  <Ionicons name="checkmark-outline" size={18} color="#16a34a" />
                  <Text style={[styles.actionTxt, { color: '#16a34a' }]}>Approve</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="checkmark-circle-outline" size={52} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>All clear</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                No listings pending review
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

export default function IndexScreen() {
  const { isAdmin } = useAuth();
  return isAdmin ? <ApprovalQueue /> : <BrowseFeed />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12,
  },
  headerTitle: { fontSize: 26, fontWeight: '700', fontFamily: 'DM_Sans_700Bold' },
  searchBar: {
    marginHorizontal: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, paddingHorizontal: 12, height: 44, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'DM_Sans_400Regular' },
  pills: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6',
  },
  pillTxt: { fontSize: 13, fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold' },
  list: { paddingBottom: 32, paddingTop: 4 },
  skeletons: { gap: 16, paddingTop: 4 },
  empty: { alignItems: 'center', paddingTop: 72, paddingHorizontal: 32, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'DM_Sans_700Bold', marginTop: 8 },
  emptySub: { fontSize: 14, fontFamily: 'DM_Sans_400Regular', textAlign: 'center' },
  badge: { borderRadius: 12, minWidth: 24, height: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeTxt: { color: '#fff', fontSize: 12, fontWeight: '700', fontFamily: 'DM_Sans_700Bold' },
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 10 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 10, borderRadius: 10,
  },
  actionTxt: { fontSize: 14, fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold' },
});
