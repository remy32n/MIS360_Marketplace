import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Alert, Modal, TextInput, ActivityIndicator, Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { listingsAPI, engagementAPI } from '../../services/api';
import {
  COLORS, FONTS, SPACING, RADIUS, CARD_STYLE, BTN_PRIMARY, BTN_DANGER,
} from '../../constants/theme';
import { getCategoryInfo, formatDateTime, getStatusInfo } from '../../utils/formatters';
import StatusBadge from '../../components/StatusBadge';
import CountdownTimer from '../../components/CountdownTimer';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ListingDetailScreen({ navigation, route }) {
  const { listingId } = route.params;
  const { user, isAdmin } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedId, setSavedId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const data = await listingsAPI.getById(listingId);
      setListing(data.listing || data);
      if (data.savedId) {
        setSavedId(data.savedId);
        setIsSaved(true);
      }
    } catch (err) {
      setError(err.response?.status === 404
        ? 'This listing is no longer available.'
        : 'Unable to load listing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListing(); }, [listingId]);

  const handleSave = async () => {
    if (isSaved && savedId) {
      try {
        await engagementAPI.unsaveListing(savedId);
        setIsSaved(false);
        setSavedId(null);
        setListing(l => l ? { ...l, saveCount: Math.max(0, (l.saveCount || 0) - 1) } : l);
      } catch (e) {
        Toast.show({ type: 'error', text1: 'Failed to unsave.' });
      }
    } else {
      try {
        const data = await engagementAPI.saveListing(listingId);
        setIsSaved(true);
        setSavedId(data.savedId);
        setListing(l => l ? { ...l, saveCount: (l.saveCount || 0) + 1 } : l);
      } catch (err) {
        if (err.response?.status === 409) {
          Toast.show({ type: 'info', text1: "You've already saved this listing." });
          setIsSaved(true);
        } else {
          Toast.show({ type: 'error', text1: 'Failed to save.' });
        }
      }
    }
  };

  const handleApprove = () => {
    Alert.alert(
      'Approve this listing?',
      'It will go live immediately and students will be notified.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Approve',
          onPress: async () => {
            setActionLoading(true);
            try {
              await listingsAPI.updateStatus(listingId, 'APPROVED');
              Toast.show({ type: 'success', text1: 'Listing approved! Students notified.' });
              navigation.goBack();
            } catch (e) {
              Toast.show({ type: 'error', text1: 'Failed to approve.' });
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await listingsAPI.updateStatus(listingId, 'REJECTED', rejectReason);
      setRejectModal(false);
      Toast.show({ type: 'success', text1: 'Listing rejected. Org notified.' });
      navigation.goBack();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to reject.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = () => {
    Alert.alert('Remove listing?', 'This will remove the listing from the platform.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await listingsAPI.remove(listingId);
            Toast.show({ type: 'success', text1: 'Listing removed.' });
            navigation.goBack();
          } catch (e) {
            Toast.show({ type: 'error', text1: 'Failed to remove.' });
          } finally {
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: `Check out: ${listing?.title} at ${listing?.buildingName}` });
    } catch (e) {}
  };

  if (loading) return <LoadingSpinner />;

  if (error || !listing) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.gray[700]} />
        </TouchableOpacity>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.gray[300]} />
          <Text style={styles.errorTitle}>{error || 'Listing not found.'}</Text>
          <TouchableOpacity style={[BTN_PRIMARY, { marginTop: SPACING.lg }]} onPress={() => navigation.goBack()}>
            <Text style={styles.btnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const cat = getCategoryInfo(listing.category);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.gray[700]} />
          <Text style={styles.backLabel}>Browse</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={22} color={COLORS.gray[700]} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {listing.posterImageUrl ? (
          <Image source={{ uri: listing.posterImageUrl }} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={[styles.heroPlaceholder, { backgroundColor: cat.bg }]}>
            <Text style={styles.heroEmoji}>{cat.emoji}</Text>
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.badgeRow}>
            <View style={[styles.catBadge, { backgroundColor: cat.bg }]}>
              <Text style={styles.catBadgeText}>{cat.emoji} {cat.label}</Text>
            </View>
            <StatusBadge status={listing.status} />
          </View>

          <Text style={styles.title}>{listing.title}</Text>

          {listing.postedByOrg?.orgName ? (
            <View style={styles.orgRow}>
              <Text style={styles.orgText}>Posted by {listing.postedByOrg.orgName} </Text>
              <Text style={{ color: COLORS.brand[600] }}>✓</Text>
            </View>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.locationSection}>
            <Ionicons name="location-outline" size={18} color={COLORS.gray[400]} />
            <View style={{ marginLeft: SPACING.sm }}>
              <Text style={styles.locationPrimary}>{listing.buildingName}</Text>
              {listing.roomOrFloor ? <Text style={styles.locationSecondary}>{listing.roomOrFloor}</Text> : null}
            </View>
          </View>

          <View style={styles.timeSection}>
            <Ionicons name="time-outline" size={18} color={COLORS.gray[400]} />
            <View style={{ marginLeft: SPACING.sm, flex: 1 }}>
              <Text style={styles.timeText}>
                <Text style={styles.timeLabel}>Starts: </Text>
                {formatDateTime(listing.startTime)}
              </Text>
              <Text style={styles.timeText}>
                <Text style={styles.timeLabel}>Ends: </Text>
                {formatDateTime(listing.endTime)}
              </Text>
              <CountdownTimer endTime={listing.endTime} />
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.description}>{listing.description}</Text>

          <Text style={styles.stats}>
            👁 {listing.viewCount || 0} views · 🔖 {listing.saveCount || 0} saves
          </Text>

          {isAdmin && (
            <View style={styles.adminCard}>
              <View style={styles.adminHeader}>
                <Ionicons name="shield-outline" size={18} color={COLORS.gray[600]} />
                <Text style={styles.adminHeaderText}>Admin Actions</Text>
              </View>
              <View style={{ marginBottom: SPACING.sm }}>
                <StatusBadge status={listing.status} />
              </View>
              {listing.status === 'PENDING' && (
                <View style={styles.adminActions}>
                  <TouchableOpacity style={styles.approveBtn} onPress={handleApprove} disabled={actionLoading}>
                    {actionLoading ? <ActivityIndicator color={COLORS.white} size="small" /> : (
                      <Text style={styles.approveBtnText}>✓ Approve</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => setRejectModal(true)} disabled={actionLoading}>
                    <Text style={styles.rejectBtnText}>✕ Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
              {listing.status === 'ACTIVE' && (
                <TouchableOpacity style={[BTN_DANGER, { width: '100%' }]} onPress={handleRemove} disabled={actionLoading}>
                  <Text style={[styles.rejectBtnText, { textAlign: 'center' }]}>Remove Listing</Text>
                </TouchableOpacity>
              )}
              {['REMOVED', 'REJECTED', 'EXPIRED'].includes(listing.status) && (
                <Text style={styles.noActionText}>No action available</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {!isAdmin && (
        <View style={styles.bottomBar}>
          {user?.role === 'STUDENT' ? (
            <TouchableOpacity
              style={[styles.saveBarBtn, isSaved && styles.saveBarBtnSaved]}
              onPress={handleSave}
            >
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={isSaved ? COLORS.white : COLORS.brand[600]}
              />
              <Text style={[styles.saveBarBtnText, isSaved && styles.saveBarBtnTextSaved]}>
                {isSaved ? 'Saved ✓' : 'Save This Item'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.viewOnly}>View Only</Text>
          )}
        </View>
      )}

      <Modal visible={rejectModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Reject this listing?</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Reason (optional, sent to org)..."
              placeholderTextColor={COLORS.gray[400]}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity
              style={[BTN_DANGER, { width: '100%', marginBottom: SPACING.md }]}
              onPress={handleReject}
              disabled={actionLoading}
            >
              {actionLoading ? <ActivityIndicator color={COLORS.error} /> : (
                <Text style={[styles.rejectBtnText, { textAlign: 'center' }]}>Reject Listing</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRejectModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  backLabel: { fontSize: FONTS.sizes.base, color: COLORS.gray[700], fontWeight: '500' },
  scrollContent: { paddingBottom: 100 },
  heroImage: { width: '100%', height: 220 },
  heroPlaceholder: {
    width: '100%',
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 72 },
  content: { padding: SPACING.base },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
  },
  catBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  catBadgeText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.gray[700] },
  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
    lineHeight: 28,
  },
  orgRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  orgText: { fontSize: FONTS.sizes.sm, color: COLORS.gray[600] },
  divider: { height: 1, backgroundColor: COLORS.gray[100], marginVertical: SPACING.base },
  locationSection: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md },
  locationPrimary: { fontSize: FONTS.sizes.base, fontWeight: '600', color: COLORS.gray[800] },
  locationSecondary: { fontSize: FONTS.sizes.sm, color: COLORS.gray[500], marginTop: 2 },
  timeSection: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md },
  timeText: { fontSize: FONTS.sizes.sm, color: COLORS.gray[700], marginBottom: 2 },
  timeLabel: { fontWeight: '600' },
  description: {
    fontSize: FONTS.sizes.base,
    color: COLORS.gray[700],
    lineHeight: 24,
    marginBottom: SPACING.base,
  },
  stats: { fontSize: FONTS.sizes.sm, color: COLORS.gray[400], marginTop: SPACING.xs },
  adminCard: {
    backgroundColor: COLORS.gray[50],
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    marginTop: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
  },
  adminHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  adminHeaderText: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.gray[800] },
  adminActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  approveBtn: {
    flex: 1,
    backgroundColor: COLORS.brand[600],
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  approveBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.sm },
  rejectBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  rejectBtnText: { color: COLORS.error, fontWeight: '700', fontSize: FONTS.sizes.sm },
  noActionText: { color: COLORS.gray[400], fontSize: FONTS.sizes.sm, fontStyle: 'italic' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
    padding: SPACING.base,
    paddingBottom: SPACING.lg,
  },
  saveBarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.brand[50],
    borderWidth: 1.5,
    borderColor: COLORS.brand[600],
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
  },
  saveBarBtnSaved: { backgroundColor: COLORS.brand[600], borderColor: COLORS.brand[600] },
  saveBarBtnText: { color: COLORS.brand[600], fontSize: FONTS.sizes.base, fontWeight: '700' },
  saveBarBtnTextSaved: { color: COLORS.white },
  viewOnly: { textAlign: 'center', color: COLORS.gray[400], fontSize: FONTS.sizes.sm },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    paddingBottom: SPACING['3xl'],
  },
  modalTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.gray[900],
    marginBottom: SPACING.base,
  },
  reasonInput: {
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.sizes.base,
    color: COLORS.gray[900],
    marginBottom: SPACING.base,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  cancelText: { textAlign: 'center', color: COLORS.gray[500], fontSize: FONTS.sizes.base },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  errorTitle: { fontSize: FONTS.sizes.lg, color: COLORS.gray[600], marginTop: SPACING.md, textAlign: 'center' },
  btnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.base },
});
