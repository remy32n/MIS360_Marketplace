import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, CARD_STYLE } from '../constants/theme';
import { getStatusInfo, getOrgTypeLabel, formatDate } from '../utils/formatters';

export default function OrgCard({ org, onVerify, onReject, onRevoke }) {
  const statusInfo = getStatusInfo(org.verificationStatus || 'PENDING');

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.typeBadge, { backgroundColor: COLORS.gray[100] }]}>
          <Text style={styles.typeText}>{getOrgTypeLabel(org.orgType)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
          <Text style={[styles.statusText, { color: statusInfo.text }]}>{statusInfo.label}</Text>
        </View>
      </View>

      <Text style={styles.orgName}>{org.orgName}</Text>

      <View style={styles.row}>
        <Ionicons name="mail-outline" size={14} color={COLORS.gray[400]} />
        <Text style={styles.meta}> {org.contactEmail}</Text>
      </View>

      <View style={styles.row}>
        <Ionicons name="calendar-outline" size={14} color={COLORS.gray[400]} />
        <Text style={styles.meta}> Joined {formatDate(org.createdAt)}</Text>
        <Text style={styles.metaDivider}> · </Text>
        <Text style={styles.meta}>{org._count?.listings ?? 0} listings</Text>
      </View>

      {org.verificationStatus === 'PENDING' && (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.verifyBtn} onPress={() => onVerify(org)}>
            <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.white} />
            <Text style={styles.verifyBtnText}>Verify Account</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectBtn} onPress={() => onReject(org)}>
            <Text style={styles.rejectBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {org.verificationStatus === 'VERIFIED' && (
        <View style={styles.actionRow}>
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={16} color={COLORS.brand[600]} />
            <Text style={styles.verifiedText}>Verified ✓</Text>
          </View>
          {onRevoke && (
            <TouchableOpacity style={styles.revokeBtn} onPress={() => onRevoke(org)}>
              <Text style={styles.revokeBtnText}>Revoke</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {org.verificationStatus === 'REJECTED' && (
        <View style={styles.actionRow}>
          <View style={styles.rejectedBadge}>
            <Text style={styles.rejectedText}>Rejected</Text>
          </View>
          {onVerify && (
            <TouchableOpacity style={styles.verifyBtn} onPress={() => onVerify(org)}>
              <Text style={styles.verifyBtnText}>Re-verify</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { ...CARD_STYLE, marginBottom: SPACING.md },
  topRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
  },
  typeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  typeText: { fontSize: FONTS.sizes.xs, color: COLORS.gray[600], fontWeight: '500' },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  statusText: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
  orgName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  meta: { fontSize: FONTS.sizes.sm, color: COLORS.gray[500] },
  metaDivider: { color: COLORS.gray[300], marginHorizontal: 2 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  verifyBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.brand[600],
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  verifyBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.sm },
  rejectBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.error,
  },
  rejectBtnText: { color: COLORS.error, fontWeight: '600', fontSize: FONTS.sizes.sm },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  verifiedText: { color: COLORS.brand[600], fontWeight: '600', fontSize: FONTS.sizes.sm },
  revokeBtn: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.gray[300],
  },
  revokeBtnText: { color: COLORS.gray[600], fontSize: FONTS.sizes.sm, fontWeight: '600' },
  rejectedBadge: {
    flex: 1,
    paddingVertical: SPACING.xs,
  },
  rejectedText: { color: COLORS.error, fontWeight: '600', fontSize: FONTS.sizes.sm },
});
