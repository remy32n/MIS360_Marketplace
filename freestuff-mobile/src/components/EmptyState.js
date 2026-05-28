import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BTN_PRIMARY, RADIUS } from '../constants/theme';

export default function EmptyState({ icon = 'cube-outline', title, subtitle, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={56} color={COLORS.gray[300]} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.btn} onPress={onAction}>
          <Text style={styles.btnText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING['2xl'],
    minHeight: 300,
  },
  title: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginTop: SPACING.base,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  btn: {
    ...BTN_PRIMARY,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  btnText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONTS.sizes.base,
  },
});
