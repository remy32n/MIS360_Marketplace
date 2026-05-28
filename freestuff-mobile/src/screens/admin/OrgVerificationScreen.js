import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, RefreshControl, Modal, ActivityIndicator,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { usersAPI } from '../../services/api';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import OrgCard from '../../components/OrgCard';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

const FILTERS = ['All', 'Pending', 'Verified', 'Rejected'];

export default function OrgVerificationScreen() {
  const isFocused = useIsFocused();
  const [orgs, setOrgs] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { org, type: 'verify'|'reject'|'revoke' }
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrgs = useCallback(async () => {
    try {
      const data = await usersAPI.getAllOrgs();
      setOrgs(data.orgs || []);
    } catch (e) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      setLoading(true);
      fetchOrgs();
    }
  }, [isFocused]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrgs();
  };

  const openConfirm = (org, type) => {
    setConfirmAction({ org, type });
    setConfirmModal(true);
  };

  const confirmMessages = {
    verify:  { title: 'Verify organization?', body: 'They will be able to post listings immediately.', btn: 'Yes, Verify', btnColor: COLORS.brand[600] },
    reject:  { title: 'Reject organization?', body: 'They will be notified and cannot post listings.', btn: 'Reject', btnColor: COLORS.error },
    revoke:  { title: 'Revoke verification?', body: 'Their verified status will be removed.', btn: 'Revoke', btnColor: COLORS.error },
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    const { org, type } = confirmAction;
    const newStatus = type === 'verify' ? 'VERIFIED' : 'REJECTED';
    setActionLoading(true);
    try {
      await usersAPI.updateOrgStatus(org.id, newStatus);
      setOrgs(os => os.map(o => o.id === org.id ? { ...o, verificationStatus: newStatus } : o));
      setConfirmModal(false);
      const labels = { verify: 'verified', reject: 'rejected', revoke: 'revoked' };
      Toast.show({ type: 'success', text1: `Organization ${labels[type]}.` });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Action failed. Please try again.' });
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = orgs.filter(o => o.verificationStatus === 'PENDING').length;

  const filtered = orgs.filter(o => {
    if (filter === 'All') return true;
    return o.verificationStatus === filter.toUpperCase();
  });

  const emptyMessages = {
    All: 'No organizations registered yet.',
    Pending: 'No org accounts pending verification.',
    Verified: 'No verified organizations.',
    Rejected: 'No rejected organizations.',
  };

  const msg = confirmAction ? confirmMessages[confirmAction.type] : null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Org Accounts</Text>
          {pendingCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{pendingCount}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <LoadingSpinner /> : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <OrgCard
              org={item}
              onVerify={() => openConfirm(item, 'verify')}
              onReject={() => openConfirm(item, 'reject')}
              onRevoke={item.verificationStatus === 'VERIFIED' ? () => openConfirm(item, 'revoke') : undefined}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.brand[600]} />}
          ListEmptyComponent={
            <EmptyState
              icon="shield-outline"
              title={emptyMessages[filter]}
            />
          }
        />
      )}

      <Modal visible={confirmModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{msg?.title}</Text>
            <Text style={styles.modalOrgName} numberOfLines={1}>{confirmAction?.org?.orgName}</Text>
            <Text style={styles.modalBody}>{msg?.body}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmModal(false)} disabled={actionLoading}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: msg?.btnColor }]}
                onPress={handleConfirm}
                disabled={actionLoading}
              >
                {actionLoading
                  ? <ActivityIndicator color={COLORS.white} />
                  : <Text style={styles.actionBtnText}>{msg?.btn}</Text>}
              </TouchableOpacity>
            </View>
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
    paddingBottom: SPACING.md,
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    gap: SPACING.sm,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
  },
  filterTabActive: { backgroundColor: COLORS.brand[600], borderColor: COLORS.brand[600] },
  filterText: { fontSize: FONTS.sizes.sm, color: COLORS.gray[600], fontWeight: '500' },
  filterTextActive: { color: COLORS.white, fontWeight: '700' },
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
  modalTitle: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.gray[900], marginBottom: 4 },
  modalOrgName: { fontSize: FONTS.sizes.base, fontWeight: '600', color: COLORS.depaul.blue, marginBottom: SPACING.sm },
  modalBody: { fontSize: FONTS.sizes.sm, color: COLORS.gray[600], lineHeight: 20, marginBottom: SPACING.base },
  modalActions: { flexDirection: 'row', gap: SPACING.md },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.gray[300],
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  cancelBtnText: { color: COLORS.gray[700], fontWeight: '600', fontSize: FONTS.sizes.base },
  actionBtn: {
    flex: 1,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  actionBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.base },
});
