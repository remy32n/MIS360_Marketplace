import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  status: string;
}

const BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  ACTIVE: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
  PENDING: { bg: '#fef9c3', text: '#854d0e', border: '#fef08a' },
  EXPIRED: { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' },
  REMOVED: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  REJECTED: { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  APPROVED: { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
};

export function ListingBadge({ status }: Props) {
  const s = BADGE_STYLES[status?.toUpperCase()] || BADGE_STYLES['EXPIRED'];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg, borderColor: s.border }]}>
      <Text style={[styles.text, { color: s.text }]}>{status?.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
