import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView,
  RefreshControl, Modal, TextInput, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { listingsAPI } from '../../services/api';
import { COLORS, FONTS, SPACING, RADIUS, BTN_DANGER } from '../../constants/theme';
import ApprovalCard from '../../components/ApprovalCard';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ApprovalQueueScreen() {
  const isFocused = useIsFocused();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [rejectModal, setRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [approveModal, setApproveModal] = useState(false);
  const [approveTarget, setApproveTarget] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  const fetchPending = useCallback(async () => {
    try {
      const data = await listingsAPI.getPending();
      setListings(data.listings || []);
    } catch (e) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      setLoading(true);
      fetchPending();
    }
  }, [isFocused]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPending();
  };

  const handleApprovePress = (listing) => {
    setApproveTarget(listing);
    setApproveModal(true);
  };

  const handleApproveConfirm = async () => {
    if (!approveTarget) return;
    setActionLoading(true);
    try {
      await listingsAPI.updateStatus(approveTarget.id, 'APPROVED');
      setListings(ls => ls.filter(l => l.id !== approveTarget.id));
      setApproveModal(false);
      Toast.show({ type: 'success', text1: 'Listing approved! Students notified.' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to approve. Please try again.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPress = (listing) => {
    setRejectTarget(listing);
    setRejectReason('');
    setRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    setActionLoading(true);
    try {
      await listingsAPI.updateStatus(rejectTarget.id, 'REJECTED', rejectReason);
      setListings(ls => ls.filter(l => l.id !== rejectTarget.id));
      setRejectModal(false);
      Toast.show({ type: 'success', text1: 'Listing rejected. Org notified.' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to reject. Please try again.' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Pending Review</Text>
          {listings.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{listings.length}</Text>
            </View>
          )}
        </View>
      </View>
      <Text style={styles.subtitle}>Oldest first — approve or reject to clear the queue</Text>

      {loading ? <LoadingSpinner /> : (
        <FlatList
          data={listings}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ApprovalCard
              listing={item}
              onApprove={handleApprovePress}
              onReject={handleRejectPress}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.brand[600]} />}
          ListEmptyComponent={
            <EmptyState
              icon="checkmark-circle-outline"
              title="All caught up! ✓"
              subtitle="No listings pending review right now."
            />
          }
        />
      )}

      {/* Approve confirmation modal */}
      <Modal visible={approveModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Approve this listing?</Text>
            <Text style={styles.modalSubtitle} numberOfLines={2}>{approveTarget?.title}</Text>
            <Text style={styles.modalBody}>It will go live immediately and all students will be notified.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setApproveModal(false)} disabled={actionLoading}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.approveBtn} onPress={handleApproveConfirm} disabled={actionLoading}>
                {actionLoading
                  ? <ActivityIndicator color={COLORS.white} />
                  : <Text style={styles.approveBtnText}>Yes, Approve</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reject modal */}
      <Modal visible={rejectModal} transparent animationType="slide">
        <View style={styles.sheetOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Reject this listing?</Text>
            <Text style={styles.modalSubtitle} numberOfLines={1}>{rejectTarget?.title}</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Reason (optional, sent to org)..."
              placeholderTextColor={COLORS.gray[400]}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[BTN_DANGER, { width: '100%', marginBottom: SPACING.md }]}
              onPress={handleRejectConfirm}
              disabled={actionLoading}
            >
              {actionLoading ? <ActivityIndicator color={COLORS.error} /> : (
                <Text style={styles.rejectBtnText}>Reject Listing</Text>
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
  safe: { flex: 1, backgroundColor: COLORS.bg.secondary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.gray[900] },
  countBadge: {
    backgroundColor: '#fef9c3',
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  countText: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: '#854d0e' },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  list: { padding: SPACING.base },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
  },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    paddingBottom: SPACING['3xl'],
  },
  modalTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.gray[900], marginBottom: SPACING.xs },
  modalSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.gray[500], marginBottom: SPACING.sm },
  modalBody: { fontSize: FONTS.sizes.sm, color: COLORS.gray[600], marginBottom: SPACING.base, lineHeight: 20 },
  modalActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.gray[300],
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.gray[700], fontWeight: '600', fontSize: FONTS.sizes.base },
  approveBtn: {
    flex: 1,
    backgroundColor: COLORS.brand[600],
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  approveBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.base },
  reasonInput: {
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONTS.sizes.base,
    color: COLORS.gray[900],
    marginBottom: SPACING.base,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  rejectBtnText: { color: COLORS.error, fontWeight: '700', fontSize: FONTS.sizes.base, textAlign: 'center' },
  cancelText: { textAlign: 'center', color: COLORS.gray[500], fontSize: FONTS.sizes.base },
});
