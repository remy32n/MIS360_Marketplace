import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, CARD_STYLE } from '../constants/theme';
import { getCategoryInfo, timeAgo, getStatusInfo } from '../utils/formatters';

export default function ListingCardHorizontal({ item, onUnsave, onPress }) {
  const { listing, savedAt, savedId } = item;
  const cat = getCategoryInfo(listing?.category || 'OTHER');
  const status = listing?.status || 'EXPIRED';
  const isExpired = status !== 'ACTIVE';
  const statusInfo = getStatusInfo(status);

  const handleUnsave = () => {
    Alert.alert(
      'Remove saved item?',
      `Remove "${listing?.title}" from your saved items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onUnsave(savedId) },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.card, isExpired && styles.dimmed]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={[styles.emojiBox, { backgroundColor: cat.bg }]}>
        <Text style={styles.emoji}>{cat.emoji}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{listing?.title}</Text>
        {listing?.postedByOrg?.orgName ? (
          <Text style={styles.meta}>{listing.postedByOrg.orgName}</Text>
        ) : null}
        <Text style={styles.meta} numberOfLines={1}>
          📍 {listing?.buildingName}{listing?.roomOrFloor ? `, ${listing.roomOrFloor}` : ''}
        </Text>
        <View style={styles.bottomRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.statusText, { color: statusInfo.text }]}>
              {status === 'ACTIVE' ? 'Still available' : status === 'REMOVED' ? 'No longer available' : 'Ended'}
            </Text>
          </View>
          <Text style={styles.savedTime}>Saved {timeAgo(savedAt)}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={handleUnsave} style={styles.trashBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="trash-outline" size={20} color={COLORS.gray[400]} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    ...CARD_STYLE,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    padding: SPACING.md,
  },
  dimmed: { opacity: 0.55 },
  emojiBox: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  emoji: { fontSize: 26 },
  content: { flex: 1, marginRight: SPACING.sm },
  title: {
    fontSize: FONTS.sizes.base,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: 4,
  },
  meta: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray[500],
    marginBottom: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  statusText: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
  savedTime: { fontSize: FONTS.sizes.xs, color: COLORS.gray[400] },
  trashBtn: {
    padding: SPACING.xs,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
