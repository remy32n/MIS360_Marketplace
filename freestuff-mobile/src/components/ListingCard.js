import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, CARD_STYLE } from '../constants/theme';
import { getCategoryInfo } from '../utils/formatters';
import StatusBadge from './StatusBadge';
import CountdownTimer from './CountdownTimer';

export default function ListingCard({ listing, onPress, onSave, isSaved, showStatus }) {
  const cat = getCategoryInfo(listing.category);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      {listing.posterImageUrl ? (
        <Image
          source={{ uri: listing.posterImageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: cat.bg }]}>
          <Text style={styles.emoji}>{cat.emoji}</Text>
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={[styles.categoryBadge, { backgroundColor: cat.bg }]}>
            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            <Text style={styles.categoryLabel}>{cat.label}</Text>
          </View>
          {showStatus && listing.status ? <StatusBadge status={listing.status} /> : null}
        </View>

        <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>

        {listing.postedByOrg?.orgName ? (
          <View style={styles.row}>
            <Ionicons name="business-outline" size={13} color={COLORS.gray[400]} />
            <Text style={styles.meta}> {listing.postedByOrg.orgName}</Text>
          </View>
        ) : null}

        <View style={styles.row}>
          <Text style={styles.meta}>📍 {listing.buildingName}</Text>
          {listing.roomOrFloor ? <Text style={styles.meta}>, {listing.roomOrFloor}</Text> : null}
        </View>

        <View style={styles.bottomRow}>
          <CountdownTimer endTime={listing.endTime} />
          {onSave !== undefined ? (
            <TouchableOpacity
              onPress={onSave}
              style={styles.saveBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={isSaved ? COLORS.brand[600] : COLORS.gray[400]}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    ...CARD_STYLE,
    marginBottom: SPACING.md,
    padding: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
  },
  emoji: { fontSize: 48 },
  content: { padding: SPACING.md },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  categoryEmoji: { fontSize: 13 },
  categoryLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginLeft: 4,
  },
  title: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
    lineHeight: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  meta: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  saveBtn: {
    padding: SPACING.xs,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
