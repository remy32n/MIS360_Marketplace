import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';

const CAT_ICONS: Record<string, any> = {
  FOOD: 'pizza-outline', DRINKS: 'cafe-outline', APPAREL: 'shirt-outline',
  SUPPLIES: 'book-outline', OTHER: 'gift-outline',
};

const CAT_BG: Record<string, string> = {
  FOOD: '#FFF3E0', DRINKS: '#E3F2FD', APPAREL: '#F3E5F5',
  SUPPLIES: '#FFFDE7', OTHER: '#E0F2F1',
};

function formatCountdown(endTime: string): string {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return 'This listing has expired';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h >= 24) return `Ends ${new Date(endTime).toLocaleDateString()}`;
  if (h > 0) return `Ends in ${h}h ${m}m`;
  return `Ends in ${m} minutes`;
}

export default function ListingDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isStudent } = useAuth();
  const qc = useQueryClient();
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const botPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  const { data: listing, isLoading } = useQuery<any>({
    queryKey: [`/api/listings/${id}`],
    enabled: !!id,
    onSuccess: (d: any) => {
      const l = d?.listing ?? d;
      setIsSaved(!!l.isSaved);
      setSavedId(l.savedId ?? null);
    },
  } as any);

  const saveMutation = useMutation({
    mutationFn: () => isSaved && savedId
      ? apiRequest('DELETE', `/api/engagement/saved/${savedId}`)
      : apiRequest('POST', '/api/engagement/saved', { listingId: id }),
    onSuccess: (res: any) => {
      if (!isSaved) setSavedId(res?.savedId ?? null);
      setIsSaved(prev => !prev);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      qc.invalidateQueries({ queryKey: ['/api/engagement/saved'] });
    },
    onError: () => Alert.alert('Error', 'Could not update saved status.'),
  });

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const l = listing?.listing ?? listing;
  if (!l) return null;

  const bg = CAT_BG[l.category] ?? colors.muted;
  const icon = CAT_ICONS[l.category] ?? 'gift-outline';
  const isExpired = new Date(l.endTime).getTime() <= Date.now();
  const isActive = l.status === 'ACTIVE' && !isExpired;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 90 }]} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: bg }]}>
          <Ionicons name={icon} size={100} color="#0a0a0a" style={{ opacity: 0.3 }} />
          {isActive && (
            <View style={styles.timeBadge}>
              <Ionicons name="time-outline" size={13} color="#0a0a0a" />
              <Text style={styles.timeTxt}>{formatCountdown(l.endTime)}</Text>
            </View>
          )}
          {!isActive && (
            <View style={[styles.timeBadge, { backgroundColor: '#fee2e2' }]}>
              <Ionicons name="close-circle-outline" size={13} color="#ef4444" />
              <Text style={[styles.timeTxt, { color: '#ef4444' }]}>Expired</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.body}>
          <Text style={[styles.title, { color: colors.foreground }]}>{l.title}</Text>

          <View style={[styles.orgRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.orgAvatar, { backgroundColor: colors.muted }]}>
              <Ionicons name="business-outline" size={16} color={colors.mutedForeground} />
            </View>
            <View>
              <Text style={[styles.orgName, { color: colors.foreground }]}>
                {l.postedByOrg?.orgName ?? 'DePaul Organization'}
              </Text>
              <Text style={[styles.orgSub, { color: colors.mutedForeground }]}>Posted by organization</Text>
            </View>
          </View>

          <View style={styles.metaBlock}>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={18} color={colors.mutedForeground} />
              <Text style={[styles.metaTxt, { color: colors.foreground }]}>
                {l.buildingName}{l.roomOrFloor ? `, ${l.roomOrFloor}` : ''}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={18} color={colors.mutedForeground} />
              <Text style={[styles.metaTxt, { color: colors.foreground }]}>
                {isActive ? formatCountdown(l.endTime) : 'Expired'}
              </Text>
            </View>
            {(l.saveCount ?? 0) > 0 && (
              <View style={styles.metaRow}>
                <Ionicons name="bookmark-outline" size={18} color={colors.mutedForeground} />
                <Text style={[styles.metaTxt, { color: colors.foreground }]}>
                  {l.saveCount} {l.saveCount === 1 ? 'student' : 'students'} saved this
                </Text>
              </View>
            )}
          </View>

          {l.description ? (
            <View style={[styles.descBlock, { borderColor: colors.border }]}>
              <Text style={[styles.descLabel, { color: colors.mutedForeground }]}>DETAILS</Text>
              <Text style={[styles.desc, { color: colors.foreground }]}>{l.description}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Save CTA */}
      {isStudent && isActive && (
        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: botPad + 12 }]}>
          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: isSaved ? colors.danger : colors.foreground },
            ]}
            onPress={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            activeOpacity={0.85}
          >
            {saveMutation.isPending
              ? <ActivityIndicator color="#fff" size="small" />
              : (
                <>
                  <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={20} color="#fff" />
                  <Text style={styles.saveTxt}>{isSaved ? 'Saved' : 'Save This'}</Text>
                </>
              )
            }
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: {},
  hero: {
    width: '100%', height: 280, alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  timeBadge: {
    position: 'absolute', top: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  timeTxt: { fontSize: 13, fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold', color: '#0a0a0a' },
  body: { padding: 20, gap: 20 },
  title: { fontSize: 24, fontWeight: '700', fontFamily: 'DM_Sans_700Bold', lineHeight: 30 },
  orgRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingBottom: 20, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  orgAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  orgName: { fontSize: 15, fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold' },
  orgSub: { fontSize: 13, fontFamily: 'DM_Sans_400Regular' },
  metaBlock: { gap: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaTxt: { fontSize: 15, fontFamily: 'DM_Sans_400Regular' },
  descBlock: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, padding: 16, gap: 8 },
  descLabel: { fontSize: 11, fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold', letterSpacing: 0.8 },
  desc: { fontSize: 15, fontFamily: 'DM_Sans_400Regular', lineHeight: 22 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth,
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, paddingVertical: 14,
  },
  saveTxt: { color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold' },
});
