import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCountdown, isEndingSoon } from '../utils/formatters';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

export default function CountdownTimer({ endTime }) {
  const [countdown, setCountdown] = useState(getCountdown(endTime));
  const urgent = isEndingSoon(endTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(endTime));
    }, 30000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (!countdown) {
    return (
      <View style={[styles.badge, styles.expired]}>
        <Text style={styles.expiredText}>Ended</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, urgent ? styles.urgent : styles.normal]}>
      <Text style={[styles.text, urgent ? styles.urgentText : styles.normalText]}>
        ⏱ {countdown}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  normal: { backgroundColor: COLORS.gray[100] },
  urgent: { backgroundColor: '#fef2f2' },
  expired: { backgroundColor: COLORS.gray[100] },
  text: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
  normalText: { color: COLORS.gray[600] },
  urgentText: { color: COLORS.error },
  expiredText: { color: COLORS.gray[500], fontSize: FONTS.sizes.xs, fontWeight: '600' },
});
