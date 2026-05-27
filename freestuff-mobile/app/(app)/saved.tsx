import React from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';
import { ListingCard } from '@/components/ListingCard';
import { ListingCardSkeleton } from '@/components/ListingCardSkeleton';

export default function SavedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['/api/engagement/saved'],
  });

  const items: any[] = data?.saved ?? data?.listings ?? (Array.isArray(data) ? data : []);
  const listings = items.map((s: any) => s.listing ?? s);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Saved</Text>
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
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No saved listings</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                Tap the heart on any listing to save it here
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
  header: { paddingHorizontal: 16, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', fontFamily: 'DM_Sans_700Bold' },
  list: { paddingBottom: 32, paddingTop: 4 },
  skeletons: { gap: 16 },
  empty: { alignItems: 'center', paddingTop: 72, paddingHorizontal: 32, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'DM_Sans_700Bold', marginTop: 8 },
  emptySub: { fontSize: 14, fontFamily: 'DM_Sans_400Regular', textAlign: 'center' },
});
