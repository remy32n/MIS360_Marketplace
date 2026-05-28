import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, BTN_PRIMARY, BTN_SECONDARY, CARD_STYLE } from '../../constants/theme';
import { getCategoryInfo, formatDateTime } from '../../utils/formatters';

export default function ListingSubmittedScreen({ navigation, route }) {
  const listing = route?.params?.listing;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 60,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  const cat = getCategoryInfo(listing?.category || 'OTHER');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Animated.View style={[styles.checkmark, { transform: [{ scale }] }]}>
          <Text style={styles.checkmarkText}>✓</Text>
        </Animated.View>

        <Text style={styles.title}>Listing Submitted!</Text>
        <Text style={styles.subtitle}>
          Your listing is pending admin review. You'll be notified when it's approved or if changes are needed.
        </Text>

        {listing && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={styles.summaryTitle} numberOfLines={2}>{listing.title}</Text>
            </View>
            <Text style={styles.summaryMeta}>📍 {listing.buildingName}, {listing.roomOrFloor}</Text>
            {listing.startTime && (
              <Text style={styles.summaryMeta}>
                🕐 {formatDateTime(listing.startTime)} → {formatDateTime(listing.endTime)}
              </Text>
            )}
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>⏳ PENDING REVIEW</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[BTN_PRIMARY, styles.btn]}
          onPress={() => {
            navigation.reset({ index: 0, routes: [{ name: 'CreateListing', params: {} }] });
          }}
        >
          <Text style={styles.btnText}>Post Another Giveaway</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[BTN_SECONDARY, styles.btn]}
          onPress={() => navigation.navigate('MyListingsMain')}
        >
          <Text style={styles.btnSecondaryText}>View My Listings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  checkmark: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.brand[600],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  checkmarkText: { fontSize: 48, color: COLORS.white, fontWeight: '800' },
  title: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: '800',
    color: COLORS.gray[900],
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.sizes.base,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  summaryCard: {
    ...CARD_STYLE,
    width: '100%',
    marginBottom: SPACING.xl,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  catEmoji: { fontSize: 28 },
  summaryTitle: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.gray[900],
  },
  summaryMeta: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    marginBottom: SPACING.xs,
  },
  pendingBadge: {
    backgroundColor: '#fef9c3',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    alignSelf: 'flex-start',
    marginTop: SPACING.sm,
  },
  pendingBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: '#854d0e',
    letterSpacing: 0.5,
  },
  btn: { width: '100%', marginBottom: SPACING.md },
  btnText: { color: COLORS.white, fontSize: FONTS.sizes.base, fontWeight: '700' },
  btnSecondaryText: { color: COLORS.brand[600], fontSize: FONTS.sizes.base, fontWeight: '700' },
});
