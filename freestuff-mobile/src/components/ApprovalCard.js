import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, CARD_STYLE } from '../constants/theme';
import { getCategoryInfo, timeAgo, formatDateTime, getOrgTypeLabel } from '../utils/formatters';

export default function ApprovalCard({ listing, onApprove, onReject }) {
  const cat = getCategoryInfo(listing.category);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.orgInfo}>
          <Text style={styles.orgName}>{listing.postedByOrg?.orgName || 'Unknown Org'}</Text>
          <View style={styles.orgTypeBadge}>
            <Text style={styles.orgTypeText}>{getOrgTypeLabel(listing.postedByOrg?.orgType)}</Text>
          </View>
        </View>
        <Text style={styles.timeAgo}>{timeAgo(listing.createdAt)}</Text>
      </View>

      <View style={styles.titleRow}>
        <View style={[styles.categoryBox, { backgroundColor: cat.bg }]}>
          <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>
        {listing.posterImageUrl ? (
          <Image source={{ uri: listing.posterImageUrl }} style={styles.thumbnail} />
        ) : null}
      </View>

      <View style={styles.row}>
        <Ionicons name="location-outline" size={14} color={COLORS.gray[400]} />
        <Text style={styles.meta}> {listing.buildingName}, {listing.roomOrFloor}</Text>
      </View>

      <Text style={styles.description} numberOfLines={2}>{listing.description}</Text>

      <View style={styles.row}>
        <Ionicons name="time-outline" size={14} color={COLORS.gray[400]} />
        <Text style={styles.meta}> {formatDateTime(listing.startTime)} → {formatDateTime(listing.endTime)}</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.approveBtn} onPress={() => onApprove(listing)}>
          <Ionicons name="checkmark" size={18} color={COLORS.white} />
          <Text style={styles.approveBtnText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectBtn} onPress={() => onReject(listing)}>
          <Ionicons name="close" size={18} color={COLORS.error} />
          <Text style={styles.rejectBtnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...CARD_STYLE,
    marginBottom: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  orgInfo: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, flex: 1 },
  orgName: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.gray[700] },
  orgTypeBadge: {
    backgroundColor: COLORS.gray[100],
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  orgTypeText: { fontSize: FONTS.sizes.xs, color: COLORS.gray[500] },
  timeAgo: { fontSize: FONTS.sizes.xs, color: COLORS.gray[400] },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  categoryBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryEmoji: { fontSize: 18 },
  title: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.gray[900],
    lineHeight: 22,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  meta: { fontSize: FONTS.sizes.sm, color: COLORS.gray[500], flex: 1 },
  description: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[600],
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.brand[600],
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  approveBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.sm },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: COLORS.error,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  rejectBtnText: { color: COLORS.error, fontWeight: '700', fontSize: FONTS.sizes.sm },
});
