import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { formatCountdown, isEndingSoon, CATEGORY_EMOJI, CATEGORY_BG } from '@/utils/formatters';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';

interface Props {
  listing: any;
  onSaveToggle?: (id: string, isSaved: boolean) => void;
}

export function ListingCard({ listing, onSaveToggle }: Props) {
  const { isStudent } = useAuth();
  const [isSaved, setIsSaved] = useState(listing.isSaved || false);
  const [saveCount, setSaveCount] = useState(listing.saveCount || 0);
  const [savedId, setSavedId] = useState(listing.savedId || null);
  const [countdown, setCountdown] = useState(formatCountdown(listing.endTime));
  const [endingSoon, setEndingSoon] = useState(isEndingSoon(listing.endTime));
  const isExpired = new Date(listing.endTime).getTime() <= new Date().getTime();
  const isActive = listing.status === 'ACTIVE' && !isExpired;

  useEffect(() => {
    if (isExpired || listing.status !== 'ACTIVE') return;
    const timer = setInterval(() => {
      setCountdown(formatCountdown(listing.endTime));
      setEndingSoon(isEndingSoon(listing.endTime));
    }, 60000);
    return () => clearInterval(timer);
  }, [listing.endTime, listing.status, isExpired]);

  const handleSaveToggle = async () => {
    if (!isStudent) {
      Alert.alert('Student account required', 'Only students can save listings.');
      return;
    }
    try {
      if (isSaved && savedId) {
        await apiRequest('DELETE', `/api/engagement/saved/${savedId}`);
        setIsSaved(false);
        setSaveCount((p: number) => Math.max(0, p - 1));
        setSavedId(null);
        onSaveToggle?.(listing.id, false);
      } else {
        const res = await apiRequest<any>('POST', '/api/engagement/saved', { listingId: listing.id });
        setIsSaved(true);
        setSaveCount((p: number) => p + 1);
        setSavedId(res.savedId);
        onSaveToggle?.(listing.id, true);
      }
    } catch {
      Alert.alert('Error', 'Could not update saved status.');
    }
  };

  const emoji = CATEGORY_EMOJI[listing.category] || '🎁';
  const bgColor = CATEGORY_BG[listing.category] || '#f3f4f6';

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => router.push(`/listing/${listing.id}`)}
      style={styles.container}
    >
      <View style={styles.imageWrapper}>
        <View style={[styles.imageBox, { backgroundColor: bgColor }]}>
          {listing.posterImageUrl ? (
            <Image source={{ uri: listing.posterImageUrl }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          ) : (
            <Text style={styles.emoji}>{emoji}</Text>
          )}
          <View style={[styles.countdownBadge, endingSoon && isActive ? styles.countdownUrgent : styles.countdownNormal]}>
            <Ionicons name={endingSoon && isActive ? 'warning' : 'time-outline'} size={12} color={endingSoon && isActive ? '#fff' : '#374151'} />
            <Text style={[styles.countdownText, endingSoon && isActive ? styles.textWhite : styles.textDark]}>
              {isActive ? countdown : 'Expired'}
            </Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{emoji} {listing.category.charAt(0) + listing.category.slice(1).toLowerCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={2}>{listing.title}</Text>
            <Text style={styles.org} numberOfLines={1}>{listing.postedByOrg?.orgName || 'DePaul Organization'}</Text>
          </View>
          {isStudent && isActive && (
            <TouchableOpacity onPress={handleSaveToggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={24} color={isSaved ? '#ff3040' : '#0a0a0a'} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color="#9ca3af" />
          <Text style={styles.locationText} numberOfLines={1}>
            {listing.buildingName}{listing.roomOrFloor ? `, ${listing.roomOrFloor}` : ''}
          </Text>
        </View>
        {saveCount > 0 && (
          <Text style={styles.saves}>{saveCount} {saveCount === 1 ? 'save' : 'saves'}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff' },
  imageWrapper: { paddingHorizontal: 12 },
  imageBox: {
    width: '100%', aspectRatio: 4 / 5, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  emoji: { fontSize: 72 },
  countdownBadge: {
    position: 'absolute', top: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  countdownNormal: { backgroundColor: 'rgba(255,255,255,0.92)' },
  countdownUrgent: { backgroundColor: 'rgba(239,68,68,0.9)' },
  countdownText: { fontSize: 11, fontWeight: '600' },
  textWhite: { color: '#fff' },
  textDark: { color: '#111827' },
  categoryBadge: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  categoryText: { fontSize: 11, fontWeight: '600', color: '#1f2937' },
  details: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  title: { fontSize: 15, fontWeight: '600', color: '#0a0a0a', lineHeight: 20 },
  org: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationText: { fontSize: 13, color: '#6b7280', flex: 1 },
  saves: { fontSize: 13, fontWeight: '700', color: '#0a0a0a', marginTop: 2 },
});
