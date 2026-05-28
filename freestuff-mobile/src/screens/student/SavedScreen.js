import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView, RefreshControl, TouchableOpacity,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { engagementAPI } from '../../services/api';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import ListingCardHorizontal from '../../components/ListingCardHorizontal';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

const FILTERS = ['All', 'Available', 'Expired'];

export default function SavedScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [savedItems, setSavedItems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSaved = useCallback(async () => {
    try {
      const data = await engagementAPI.getSaved();
      setSavedItems(data.savedListings || []);
    } catch (e) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      setLoading(true);
      fetchSaved();
    }
  }, [isFocused]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSaved();
  };

  const handleUnsave = async (savedId) => {
    try {
      await engagementAPI.unsaveListing(savedId);
      setSavedItems(items => items.filter(i => i.savedId !== savedId));
    } catch (e) {}
  };

  const filteredItems = savedItems.filter(item => {
    const status = item.listing?.status;
    if (filter === 'Available') return status === 'ACTIVE';
    if (filter === 'Expired') return status !== 'ACTIVE';
    return true;
  });

  const emptyMessages = {
    All: { title: 'Nothing saved yet', subtitle: 'Browse listings and tap the bookmark to save items.', action: 'Browse Items' },
    Available: { title: 'No available items saved', subtitle: 'Items you save that are still active appear here.' },
    Expired: { title: 'No expired saved items', subtitle: 'Saved items that have ended appear here.' },
  };
  const em = emptyMessages[filter];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Items</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{savedItems.length}</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f} style={styles.tab} onPress={() => setFilter(f)}>
            <Text style={[styles.tabText, filter === f && styles.tabTextActive]}>{f}</Text>
            {filter === f && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <LoadingSpinner /> : (
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.savedId || item.id}
          renderItem={({ item }) => (
            <ListingCardHorizontal
              item={item}
              onUnsave={handleUnsave}
              onPress={() => navigation.navigate('ListingDetail', { listingId: item.listing?.id })}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.brand[600]} />}
          ListEmptyComponent={
            <EmptyState
              icon="bookmark-outline"
              title={em.title}
              subtitle={em.subtitle}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.gray[900], marginRight: SPACING.sm },
  countBadge: {
    backgroundColor: COLORS.brand[100],
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  countText: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.brand[700] },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  tab: { paddingVertical: SPACING.md, marginRight: SPACING.xl, position: 'relative' },
  tabText: { fontSize: FONTS.sizes.base, color: COLORS.gray[400], fontWeight: '500' },
  tabTextActive: { color: COLORS.brand[600], fontWeight: '700' },
  tabUnderline: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 2, backgroundColor: COLORS.brand[600], borderRadius: 1,
  },
  list: { padding: SPACING.base },
});
