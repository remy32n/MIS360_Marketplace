import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Platform, TextInput, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { formatCountdown, isEndingSoon, CATEGORY_EMOJI, CATEGORY_BG, timeAgo } from '@/utils/formatters';
import { ListingBadge } from '@/components/ListingBadge';

export default function ListingDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isStudent, isAdmin, isOrg, user } = useAuth();
  const qc = useQueryClient();
  const botPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  const [savedId, setSavedId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [endingSoon, setEndingSoon] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading, refetch } = useQuery<any>({
    queryKey: [`/api/listings/${id}`],
    enabled: !!id,
  });

  const l = data?.listing ?? data;

  useEffect(() => {
    if (!l?.endTime) return;
    setCountdown(formatCountdown(l.endTime));
    setEndingSoon(isEndingSoon(l.endTime));
    setIsSaved(!!l.isSaved);
    setSavedId(l.savedId ?? null);
    const timer = setInterval(() => {
      setCountdown(formatCountdown(l.endTime));
      setEndingSoon(isEndingSoon(l.endTime));
    }, 60000);
    return () => clearInterval(timer);
  }, [l?.endTime, l?.isSaved, l?.savedId]);

  const saveMutation = useMutation({
    mutationFn: () => isSaved && savedId
      ? apiRequest('DELETE', `/api/engagement/saved/${savedId}`)
      : apiRequest<any>('POST', '/api/engagement/saved', { listingId: id }),
    onSuccess: (res: any) => {
      if (!isSaved && res?.savedId) setSavedId(res.savedId);
      setIsSaved(prev => !prev);
      qc.invalidateQueries({ queryKey: ['/api/engagement/saved'] });
    },
    onError: () => Alert.alert('Error', 'Could not update saved status.'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ status, reason }: { status: string; reason?: string }) =>
      apiRequest('PATCH', `/api/listings/${id}/status`, { status, reason }),
    onSuccess: () => {
      refetch();
      qc.invalidateQueries({ queryKey: ['/api/listings/admin/pending'] });
      qc.invalidateQueries({ queryKey: ['/api/listings/admin/all'] });
      setRejectModalVisible(false);
      setRejectReason('');
    },
    onError: () => Alert.alert('Error', 'Could not update listing status.'),
  });

  const removeMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', `/api/listings/${id}`),
    onSuccess: () => { router.back(); qc.invalidateQueries({ queryKey: ['/api/listings/mine'] }); },
    onError: () => Alert.alert('Error', 'Could not remove listing.'),
  });

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!l) return null;

  const isExpired = new Date(l.endTime).getTime() <= Date.now();
  const isActive = l.status === 'ACTIVE' && !isExpired;
  const isPending = l.status === 'PENDING';
  const bgColor = CATEGORY_BG[l.category] ?? '#f3f4f6';
  const emoji = CATEGORY_EMOJI[l.category] ?? '🎁';
  const isMyListing = isOrg && l.postedByOrg?.userId === user?.id;

  const confirmReject = () => {
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const confirmRemove = () => {
    Alert.alert('Remove Listing', 'Are you sure you want to remove this listing?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeMutation.mutate() },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + (isStudent && isActive ? 90 : 24) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: bgColor }]}>
          <Text style={styles.heroEmoji}>{emoji}</Text>
          <View style={[
            styles.timeBadge,
            endingSoon && isActive ? styles.timeBadgeUrgent : styles.timeBadgeNormal,
          ]}>
            <Ionicons
              name={endingSoon && isActive ? 'warning' : isActive ? 'time-outline' : 'close-circle-outline'}
              size={13}
              color={endingSoon && isActive ? '#fff' : isActive ? '#0a0a0a' : '#ef4444'}
            />
            <Text style={[
              styles.timeTxt,
              endingSoon && isActive ? styles.timeTxtUrgent : !isActive ? styles.timeTxtExpired : styles.timeTxtNormal,
            ]}>
              {isActive ? countdown : 'Expired'}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.foreground }]}>{l.title}</Text>
            <ListingBadge status={l.status} />
          </View>

          <View style={[styles.orgRow, { borderBottomColor: colors.border }]}>
            <View style={[styles.orgAvatar, { backgroundColor: colors.muted }]}>
              <Ionicons name="business-outline" size={16} color={colors.mutedForeground} />
            </View>
            <View>
              <Text style={[styles.orgName, { color: colors.foreground }]}>
                {l.postedByOrg?.orgName ?? 'DePaul Organization'}
              </Text>
              <Text style={[styles.orgSub, { color: colors.mutedForeground }]}>
                Posted {timeAgo(l.createdAt)}
              </Text>
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
                {isActive ? countdown : `Ended ${new Date(l.endTime).toLocaleDateString()}`}
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
            <View style={styles.metaRow}>
              <Ionicons name="pricetag-outline" size={18} color={colors.mutedForeground} />
              <Text style={[styles.metaTxt, { color: colors.foreground }]}>
                {emoji} {l.category.charAt(0) + l.category.slice(1).toLowerCase()}
              </Text>
            </View>
          </View>

          {l.description ? (
            <View style={[styles.descBlock, { borderColor: colors.border }]}>
              <Text style={[styles.descLabel, { color: colors.mutedForeground }]}>DETAILS</Text>
              <Text style={[styles.desc, { color: colors.foreground }]}>{l.description}</Text>
            </View>
          ) : null}

          {l.status === 'REJECTED' && l.rejectionReason && (
            <View style={styles.rejectedBlock}>
              <Ionicons name="alert-circle-outline" size={18} color="#dc2626" />
              <View style={{ flex: 1 }}>
                <Text style={styles.rejectedLabel}>Rejection reason</Text>
                <Text style={styles.rejectedText}>{l.rejectionReason}</Text>
              </View>
            </View>
          )}

          {/* Admin actions */}
          {isAdmin && isPending && (
            <View style={styles.adminActions}>
              <Text style={[styles.adminTitle, { color: colors.foreground }]}>Admin Actions</Text>
              <View style={styles.adminBtns}>
                <TouchableOpacity
                  style={[styles.adminBtn, { backgroundColor: '#fee2e2' }]}
                  onPress={confirmReject}
                  disabled={statusMutation.isPending}
                >
                  <Ionicons name="close-outline" size={18} color="#dc2626" />
                  <Text style={[styles.adminBtnTxt, { color: '#dc2626' }]}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.adminBtn, { backgroundColor: '#dcfce7' }]}
                  onPress={() => statusMutation.mutate({ status: 'ACTIVE' })}
                  disabled={statusMutation.isPending}
                >
                  {statusMutation.isPending
                    ? <ActivityIndicator size="small" color="#16a34a" />
                    : <Ionicons name="checkmark-outline" size={18} color="#16a34a" />
                  }
                  <Text style={[styles.adminBtnTxt, { color: '#16a34a' }]}>Approve</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {(isAdmin || isMyListing) && (isActive || isPending) && (
            <TouchableOpacity
              style={[styles.removeBtn, { borderColor: colors.danger + '40', backgroundColor: colors.danger + '10' }]}
              onPress={confirmRemove}
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending
                ? <ActivityIndicator size="small" color={colors.danger} />
                : <Ionicons name="trash-outline" size={18} color={colors.danger} />
              }
              <Text style={[styles.removeBtnTxt, { color: colors.danger }]}>Remove Listing</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Save CTA */}
      {isStudent && isActive && (
        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: botPad + 12 }]}>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: isSaved ? '#ff3040' : colors.foreground }]}
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

      {/* Reject modal */}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Reject Listing</Text>
            <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
              Provide a reason for rejection (optional)
            </Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.muted, color: colors.foreground }]}
              placeholder="e.g. Insufficient information provided"
              placeholderTextColor={colors.mutedForeground}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.muted }]}
                onPress={() => setRejectModalVisible(false)}
              >
                <Text style={[styles.modalBtnTxt, { color: colors.foreground }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#fee2e2' }]}
                onPress={() => statusMutation.mutate({ status: 'REJECTED', reason: rejectReason || undefined })}
                disabled={statusMutation.isPending}
              >
                {statusMutation.isPending
                  ? <ActivityIndicator size="small" color="#dc2626" />
                  : <Text style={[styles.modalBtnTxt, { color: '#dc2626' }]}>Reject</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  heroEmoji: { fontSize: 100 },
  timeBadge: {
    position: 'absolute', top: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  timeBadgeNormal: { backgroundColor: 'rgba(255,255,255,0.92)' },
  timeBadgeUrgent: { backgroundColor: 'rgba(239,68,68,0.9)' },
  timeTxt: { fontSize: 13, fontWeight: '600' },
  timeTxtNormal: { color: '#0a0a0a' },
  timeTxtUrgent: { color: '#fff' },
  timeTxtExpired: { color: '#ef4444' },
  body: { padding: 20, gap: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  title: { fontSize: 24, fontWeight: '700', lineHeight: 30, flex: 1 },
  orgRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingBottom: 20, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  orgAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  orgName: { fontSize: 15, fontWeight: '600' },
  orgSub: { fontSize: 13 },
  metaBlock: { gap: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  metaTxt: { fontSize: 15 },
  descBlock: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, padding: 16, gap: 8 },
  descLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8 },
  desc: { fontSize: 15, lineHeight: 22 },
  rejectedBlock: {
    flexDirection: 'row', gap: 10, backgroundColor: '#fff1f2',
    padding: 14, borderRadius: 12, alignItems: 'flex-start',
  },
  rejectedLabel: { fontSize: 12, fontWeight: '600', color: '#dc2626', marginBottom: 2 },
  rejectedText: { fontSize: 13, color: '#dc2626' },
  adminActions: { gap: 10 },
  adminTitle: { fontSize: 15, fontWeight: '700' },
  adminBtns: { flexDirection: 'row', gap: 10 },
  adminBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: 12,
  },
  adminBtnTxt: { fontSize: 14, fontWeight: '600' },
  removeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 12, paddingVertical: 12, borderWidth: 1,
  },
  removeBtnTxt: { fontSize: 14, fontWeight: '600' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth,
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, paddingVertical: 14,
  },
  saveTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center', padding: 24,
  },
  modalBox: {
    width: '100%', maxWidth: 400, borderRadius: 20, padding: 24, gap: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalSub: { fontSize: 14, marginTop: -6 },
  modalInput: {
    borderRadius: 12, padding: 12, fontSize: 14, height: 80, marginTop: 4,
  },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  modalBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12 },
  modalBtnTxt: { fontSize: 14, fontWeight: '600' },
});
