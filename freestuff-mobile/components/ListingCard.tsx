import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

export interface Listing {
  id: string;
  title: string;
  category: 'FOOD' | 'DRINKS' | 'APPAREL' | 'SUPPLIES' | 'OTHER';
  buildingName: string;
  roomOrFloor?: string;
  endTime: string;
  status: string;
  saveCount?: number;
  isSaved?: boolean;
  savedId?: string;
  postedByOrg?: { orgName?: string };
}

interface Props {
  listing: Listing;
  showSaveButton?: boolean;
}

const ICONS: Record<string, any> = {
  FOOD: 'pizza-outline',
  DRINKS: 'cafe-outline',
  APPAREL: 'shirt-outline',
  SUPPLIES: 'book-outline',
  OTHER: 'gift-outline',
};

const LABELS: Record<string, string> = {
  FOOD: 'Food', DRINKS: 'Drinks', APPAREL: 'Merch', SUPPLIES: 'Supplies', OTHER: 'Other',
};

function formatCountdown(endTime: string): string {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h >= 24) return `Ends ${new Date(endTime).toLocaleDateString()}`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m left`;
}

function isEndingSoon(endTime: string): boolean {
  const diff = new Date(endTime).getTime() - Date.now();
  return diff > 0 && diff < 3600000;
}

export function ListingCard({ listing, showSaveButton = true }: Props) {
  const colors = useColors();
  const icon = ICONS[listing.category] ?? 'gift-outline';
  const label = LABELS[listing.category] ?? 'Other';
  const countdown = formatCountdown(listing.endTime);
  const endingSoon = isEndingSoon(listing.endTime);
  const isExpired = new Date(listing.endTime).getTime() <= Date.now();
  const isActive = listing.status === 'ACTIVE' && !isExpired;

  const bgMap: Record<string, string> = {
    FOOD: colors.categoryFood,
    DRINKS: colors.categoryDrinks,
    APPAREL: colors.categoryApparel,
    SUPPLIES: colors.categorySupplies,
    OTHER: colors.categoryOther,
  };
  const bg = bgMap[listing.category] ?? colors.muted;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.95}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/listing/${listing.id}`);
      }}
    >
      {/* Image area */}
      <View style={[styles.imageArea, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={80} color={colors.foreground} style={{ opacity: 0.35 }} />

        <View style={[
          styles.timeBadge,
          isActive && endingSoon
            ? { backgroundColor: colors.danger }
            : { backgroundColor: 'rgba(255,255,255,0.92)' },
        ]}>
          <Ionicons
            name={isActive && endingSoon ? 'alert-circle-outline' : 'time-outline'}
            size={12}
            color={isActive && endingSoon ? '#fff' : colors.mutedForeground}
          />
          <Text style={[styles.timeBadgeText, { color: isActive && endingSoon ? '#fff' : colors.foreground }]}>
            {isActive ? countdown : 'Expired'}
          </Text>
        </View>

        <View style={styles.catBadge}>
          <Text style={styles.catBadgeText}>{label}</Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>
        <Text style={styles.org} numberOfLines={1}>
          {listing.postedByOrg?.orgName ?? 'DePaul Organization'}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
          <Text style={styles.location} numberOfLines={1}>
            {listing.buildingName}{listing.roomOrFloor ? `, ${listing.roomOrFloor}` : ''}
          </Text>
        </View>
        {(listing.saveCount ?? 0) > 0 && (
          <Text style={styles.saves}>
            {listing.saveCount} {listing.saveCount === 1 ? 'save' : 'saves'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  imageArea: {
    width: '100%',
    aspectRatio: 4 / 3,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  timeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  timeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'DM_Sans_600SemiBold',
  },
  catBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  catBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0a0a0a',
    fontFamily: 'DM_Sans_600SemiBold',
  },
  details: {
    padding: 14,
    gap: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0a0a0a',
    fontFamily: 'DM_Sans_600SemiBold',
    marginBottom: 1,
  },
  org: {
    fontSize: 13,
    color: '#6b7280',
    fontFamily: 'DM_Sans_400Regular',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  location: {
    fontSize: 13,
    color: '#6b7280',
    fontFamily: 'DM_Sans_400Regular',
    flex: 1,
  },
  saves: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0a0a0a',
    fontFamily: 'DM_Sans_600SemiBold',
    marginTop: 3,
  },
});
