import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, ScrollView,
  TouchableOpacity, RefreshControl, StyleSheet, SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { listingsAPI, engagementAPI } from '../../services/api';
import { COLORS, FONTS, SPACING, RADIUS, CARD_STYLE } from '../../constants/theme';
import ListingCard from '../../components/ListingCard';
import CategoryPill, { CATEGORIES } from '../../components/CategoryPill';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function BrowseScreen({ navigation }) {
  const { user, isAdmin } = useAuth();
  const isFocused = useIsFocused();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [sort, setSort] = useState('recent');
  const [savedMap, setSavedMap] = useState({}); // { listingId: savedId }
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const searchTimer = useRef(null);
  const refreshTimer = useRef(null);

  const fetchListings = useCallback(async (reset = true) => {
    try {
      const params = {
        page: reset ? 1 : page,
        limit: 12,
        sort,
        ...(category !== 'ALL' ? { category } : {}),
        ...(search.trim() ? { search: search.trim() } : {}),
      };
      const data = await listingsAPI.getAll(params);
      if (reset) {
        setListings(data.listings || []);
        setPage(1);
      } else {
        setListings(prev => [...prev, ...(data.listings || [])]);
      }
      setTotalPages(data.totalPages || 1);
    } catch (e) {
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [category, sort, search, page]);

  const fetchSaved = useCallback(async () => {
    if (user?.role !== 'STUDENT') return;
    try {
      const data = await engagementAPI.getSaved();
      const map = {};
      (data.savedListings || []).forEach(s => {
        if (s.listing?.id) map[s.listing.id] = s.savedId;
      });
      setSavedMap(map);
    } catch (e) {}
  }, [user]);

  useEffect(() => {
    if (isFocused) {
      setLoading(true);
      fetchListings(true);
      fetchSaved();
    }
  }, [isFocused, category, sort]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setLoading(true);
      fetchListings(true);
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  useEffect(() => {
    if (!isFocused) return;
    refreshTimer.current = setInterval(() => fetchListings(true), 60000);
    return () => clearInterval(refreshTimer.current);
  }, [isFocused, category, sort, search]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings(true);
    fetchSaved();
  };

  const onLoadMore = () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    setPage(p => p + 1);
    fetchListings(false);
  };

  const handleSave = async (listing) => {
    const savedId = savedMap[listing.id];
    if (savedId) {
      try {
        await engagementAPI.unsaveListing(savedId);
        setSavedMap(m => { const n = { ...m }; delete n[listing.id]; return n; });
      } catch (e) {}
    } else {
      try {
        const data = await engagementAPI.saveListing(listing.id);
        setSavedMap(m => ({ ...m, [listing.id]: data.savedId }));
      } catch (e) {}
    }
  };

  const goToDetail = (listing) => {
    navigation.navigate('ListingDetail', { listingId: listing.id });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hey {user?.firstName} 👋</Text>
        <Text style={styles.subGreeting}>Here's what's free on campus</Text>

        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color={COLORS.gray[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search listings..."
            placeholderTextColor={COLORS.gray[400]}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={COLORS.gray[400]} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pills}>
          {CATEGORIES.map(c => (
            <CategoryPill
              key={c.key}
              category={c.key}
              active={category === c.key}
              onPress={() => setCategory(c.key)}
            />
          ))}
        </ScrollView>

        <View style={styles.metaRow}>
          <Text style={styles.resultCount}>{listings.length} item{listings.length !== 1 ? 's' : ''} available</Text>
          <TouchableOpacity
            style={styles.sortBtn}
            onPress={() => setSort(s => s === 'recent' ? 'ending_soon' : 'recent')}
          >
            <Ionicons name="funnel-outline" size={14} color={COLORS.depaul.blue} />
            <Text style={styles.sortText}>{sort === 'recent' ? 'Most Recent' : 'Ending Soon'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ListingCard
              listing={item}
              onPress={() => goToDetail(item)}
              onSave={user?.role === 'STUDENT' ? () => handleSave(item) : undefined}
              isSaved={!!savedMap[item.id]}
              showStatus={isAdmin}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.brand[600]} />
          }
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <EmptyState
              icon="cube-outline"
              title="No listings available"
              subtitle="Check back soon — new giveaways are posted regularly."
            />
          }
          ListFooterComponent={loadingMore ? <ActivityIndicator color={COLORS.brand[600]} style={{ padding: 16 }} /> : null}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg.secondary },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  greeting: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.depaul.blue,
  },
  subGreeting: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    marginBottom: SPACING.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchIcon: { marginRight: SPACING.sm },
  searchInput: {
    flex: 1,
    fontSize: FONTS.sizes.base,
    color: COLORS.gray[900],
    paddingVertical: SPACING.sm,
  },
  clearBtn: { padding: SPACING.xs },
  pills: { marginBottom: SPACING.md },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultCount: { fontSize: FONTS.sizes.sm, color: COLORS.gray[500] },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.depaul.lightBlue,
  },
  sortText: { fontSize: FONTS.sizes.sm, color: COLORS.depaul.blue, fontWeight: '600' },
  list: { padding: SPACING.base, paddingTop: SPACING.md },
});
