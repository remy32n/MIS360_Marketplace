import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getStatusInfo } from '../utils/formatters';
import { FONTS, RADIUS, SPACING } from '../constants/theme';

export default function StatusBadge({ status }) {
  const info = getStatusInfo(status);
  return (
    <View style={[styles.badge, { backgroundColor: info.bg }]}>
      <Text style={[styles.text, { color: info.text }]}>{info.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  text: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '600',
  },
});
