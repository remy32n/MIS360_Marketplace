import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, RefreshControl,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { engagementAPI } from '../../services/api';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { timeAgo } from '../../utils/formatters';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

const FILTERS = ['All', 'Unread'];

function getDotColor(type) {
  if (type === 'LISTING_APPROVED') return COLORS.brand[600];
  if (type === 'LISTING_REJECTED') return COLORS.error;
  return COLORS.warning;
}

export default function NotificationsScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const params = filter === 'Unread' ? { unread: true } : {};
      const data = await engagementAPI.getNotifications(params);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => {
    if (isFocused) {
      setLoading(true);
      fetchNotifications();
    }
  }, [isFocused, filter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await engagementAPI.markAllRead();
      setNotifications(n => n.map(x => ({ ...x, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const handleTap = async (notif) => {
    if (!notif.readAt) {
      try {
        await engagementAPI.markRead(notif.id);
        setNotifications(n => n.map(x => x.id === notif.id ? { ...x, readAt: new Date().toISOString() } : x));
        setUnreadCount(c => Math.max(0, c - 1));
      } catch (e) {}
    }
    if (notif.listingId) {
      navigation.navigate('ListingDetail', { listingId: notif.listingId });
    }
  };

  const renderItem = ({ item }) => {
    const isUnread = !item.readAt;
    return (
      <TouchableOpacity
        style={[styles.row, isUnread && styles.rowUnread]}
        onPress={() => handleTap(item)}
        activeOpacity={0.85}
      >
        <View style={[styles.dot, { backgroundColor: getDotColor(item.notificationType) }]} />
        <View style={styles.rowContent}>
          <Text style={[styles.message, isUnread && styles.messageBold]}>{item.message}</Text>
          <Text style={styles.time}>{timeAgo(item.sentAt)}</Text>
        </View>
        {item.listingId ? <Ionicons name="chevron-forward" size={16} color={COLORS.gray[300]} /> : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        )}
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
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.brand[600]} />}
          ListEmptyComponent={
            <EmptyState
              icon="notifications-outline"
              title="No notifications yet"
              subtitle="We'll let you know when something new is posted."
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.gray[900] },
  markAll: { fontSize: FONTS.sizes.sm, color: COLORS.depaul.blue, fontWeight: '600' },
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.brand[600],
    borderRadius: 1,
  },
  list: { padding: SPACING.base },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  rowUnread: { backgroundColor: '#EBF5FF', borderColor: '#C7E0FF' },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.md,
  },
  rowContent: { flex: 1 },
  message: { fontSize: FONTS.sizes.sm, color: COLORS.gray[700], lineHeight: 18 },
  messageBold: { fontWeight: '700', color: COLORS.gray[900] },
  time: { fontSize: FONTS.sizes.xs, color: COLORS.gray[400], marginTop: 4 },
});
