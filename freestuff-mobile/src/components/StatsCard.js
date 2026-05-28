import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

export default function StatsCard({ label, value, icon, color }) {
  const bg = color || COLORS.brand[50];
  const iconColor = color ? COLORS.white : COLORS.brand[600];
  return (
    <View style={[styles.card, { backgroundColor: color ? color : COLORS.white }]}>
      <View style={[styles.iconBox, { backgroundColor: color ? 'rgba(255,255,255,0.25)' : COLORS.brand[100] }]}>
        <Ionicons name={icon} size={22} color={color ? COLORS.white : COLORS.brand[600]} />
      </View>
      <Text style={[styles.value, { color: color ? COLORS.white : COLORS.gray[900] }]}>
        {value ?? '—'}
      </Text>
      <Text style={[styles.label, { color: color ? 'rgba(255,255,255,0.85)' : COLORS.gray[500] }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    margin: SPACING.xs,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray[100],
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  value: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: '800',
    marginBottom: 2,
  },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '500',
  },
});
