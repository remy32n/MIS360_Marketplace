import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

const CATEGORIES = [
  { key: 'ALL',     label: 'All',     emoji: '🏷️' },
  { key: 'FOOD',    label: 'Food',    emoji: '🍕' },
  { key: 'DRINKS',  label: 'Drinks',  emoji: '🥤' },
  { key: 'APPAREL', label: 'Apparel', emoji: '👕' },
  { key: 'SUPPLIES',label: 'Supplies',emoji: '📚' },
  { key: 'OTHER',   label: 'Other',   emoji: '🎁' },
];

export { CATEGORIES };

export default function CategoryPill({ category, active, onPress }) {
  const info = CATEGORIES.find(c => c.key === category) || CATEGORIES[0];
  return (
    <TouchableOpacity
      style={[styles.pill, active ? styles.active : styles.inactive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.emoji}>{info.emoji}</Text>
      <Text style={[styles.label, active ? styles.activeLabel : styles.inactiveLabel]}>
        {info.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginRight: SPACING.sm,
    borderWidth: 1.5,
  },
  active: {
    backgroundColor: COLORS.brand[600],
    borderColor: COLORS.brand[600],
  },
  inactive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.gray[200],
  },
  emoji: { fontSize: 14, marginRight: 4 },
  label: { fontSize: FONTS.sizes.sm, fontWeight: '600' },
  activeLabel: { color: COLORS.white },
  inactiveLabel: { color: COLORS.gray[600] },
});
