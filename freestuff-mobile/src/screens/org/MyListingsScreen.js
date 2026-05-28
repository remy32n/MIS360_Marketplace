import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, RefreshControl, Alert,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { listingsAPI } from '../../services/api';
import { COLORS, FONTS, SPACING, RADIUS, CARD_STYLE } from '../../constants/theme';
import { getCategoryInfo, getStatusInfo, timeAgo } from '../../utils/formatters';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

const FILTERS = ['All', 'Pending', 'Active', 'Expired', 'Removed'];

export default function MyListingsScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [listings, setListings] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchListings = useCallback(async () => {
    try {
      const data = await listingsAPI.getMyListings();
      setListings(data.listings || []);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Could not load listings.', text2: e?.response?.data?.error || e?.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      setLoading(true);
      fetchListings();
    }
  }, [isFocused]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  const handleRemove = (listing) => {
    Alert.alert(
      'Remove listing?',
      `Remove "${listing.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await listingsAPI.remove(listing.id);
              setListings(ls => ls.map(l => l.id === listing.id ? { ...l, status: 'REMOVED' } : l));
              Toast.show({ type: 'success', text1: 'Listing removed.' });
            } catch (e) {
              Toast.show({ type: 'error', text1: 'Failed to remove listing.' });
            }
          },
        },
      ]
    );
  };

  const filtered = listings.filter(l => {
    if (filter === 'All') return true;
    return l.status === filter.toUpperCase();
  });

  const cat = (category) => getCategoryInfo(category);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ListingDetail', { listingId: item.id })}
      activeOpacity={0.9}
    >
      <View style={styles.cardTop}>
        <View style={[styles.catBox, { backgroundColor: cat(item.category).bg }]}>
          <Text style={styles.catEmoji}>{cat(item.category).emoji}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.cardMeta}>📍 {item.buildingName}</Text>
          <Text style={styles.cardMeta}>{timeAgo(item.createdAt)}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      {['PENDING', 'ACTIVE'].includes(item.status) && (
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('CreateListing', { listing: item })}
          >
            <Ionicons name="pencil-outline" size={16} color={COLORS.depaul.blue} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item)}>
            <Ionicons name="trash-outline" size={16} color={COLORS.error} />
            <Text style={styles.removeBtnText}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const emptyMessages = {
    All: { title: "No listings yet", subtitle: "Post your first giveaway!", action: "Post Now" },
    Pending: { title: "No pending listings", subtitle: "Listings awaiting admin review appear here." },
    Active: { title: "No active listings", subtitle: "Post a new giveaway to get started!", action: "Post Now" },
    Expired: { title: "No expired listings", subtitle: "Past listings that ended appear here." },
    Removed: { title: "No removed listings", subtitle: "Listings you've removed appear here." },
  };
  const em = emptyMessages[filter];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>My Listings</Text>
        <TouchableOpacity
          style={styles.postBtn}
          onPress={() => navigation.navigate('CreateListing', {})}
        >
          <Ionicons name="add" size={18} color={COLORS.white} />
          <Text style={styles.postBtnText}>Post New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <LoadingSpinner /> : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.brand[600]} />}
          ListEmptyComponent={
            <EmptyState
              icon="list-outline"
              title={em.title}
              subtitle={em.subtitle}
              actionLabel={em.action}
              onAction={em.action ? () => navigation.navigate('CreateListing', {}) : undefined}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg.secondary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.gray[900] },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.brand[600],
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: 4,
  },
  postBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.sm },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    gap: SPACING.xs,
    flexWrap: 'wrap',
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
  },
  filterTabActive: { backgroundColor: COLORS.brand[600], borderColor: COLORS.brand[600] },
  filterText: { fontSize: FONTS.sizes.sm, color: COLORS.gray[600], fontWeight: '500' },
  filterTextActive: { color: COLORS.white, fontWeight: '700' },
  list: { padding: SPACING.base },
  card: { ...CARD_STYLE, marginBottom: SPACING.md },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  catBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catEmoji: { fontSize: 22 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: FONTS.sizes.base, fontWeight: '700', color: COLORS.gray[900], marginBottom: 4 },
  cardMeta: { fontSize: FONTS.sizes.sm, color: COLORS.gray[500] },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.depaul.blue,
  },
  editBtnText: { color: COLORS.depaul.blue, fontWeight: '600', fontSize: FONTS.sizes.sm },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.error,
  },
  removeBtnText: { color: COLORS.error, fontWeight: '600', fontSize: FONTS.sizes.sm },
});
