import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, RefreshControl, Alert,
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

  const handleVerify = (org) => {
    Alert.alert(
      `Verify "${org.orgName}"?`,
      'They will be able to post listings immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Verify',
          onPress: async () => {
            try {
              await usersAPI.updateOrgStatus(org.id, 'VERIFIED');
              setOrgs(os => os.map(o => o.id === org.id ? { ...o, verificationStatus: 'VERIFIED' } : o));
              Toast.show({ type: 'success', text1: 'Organization verified.' });
            } catch (e) {
              Toast.show({ type: 'error', text1: 'Failed to verify organization.' });
            }
          },
        },
      ]
    );
  };

  const handleReject = (org) => {
    Alert.alert(
      `Reject "${org.orgName}"?`,
      'They will be notified and cannot post listings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await usersAPI.updateOrgStatus(org.id, 'REJECTED');
              setOrgs(os => os.map(o => o.id === org.id ? { ...o, verificationStatus: 'REJECTED' } : o));
              Toast.show({ type: 'success', text1: 'Organization rejected.' });
            } catch (e) {
              Toast.show({ type: 'error', text1: 'Failed to reject organization.' });
            }
          },
        },
      ]
    );
  };

  const handleRevoke = (org) => {
    Alert.alert('Revoke verification?', `Remove verified status from "${org.orgName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Revoke',
        style: 'destructive',
        onPress: async () => {
          try {
            await usersAPI.updateOrgStatus(org.id, 'REJECTED');
            setOrgs(os => os.map(o => o.id === org.id ? { ...o, verificationStatus: 'REJECTED' } : o));
            Toast.show({ type: 'success', text1: 'Verification revoked.' });
          } catch (e) {
            Toast.show({ type: 'error', text1: 'Failed to revoke.' });
          }
        },
      },
    ]);
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
              onVerify={() => handleVerify(item)}
              onReject={() => handleReject(item)}
              onRevoke={item.verificationStatus === 'VERIFIED' ? () => handleRevoke(item) : undefined}
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
});
