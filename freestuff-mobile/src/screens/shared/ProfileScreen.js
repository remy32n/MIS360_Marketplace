import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  SafeAreaView, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, CARD_STYLE } from '../../constants/theme';
import { getStatusInfo, getOrgTypeLabel } from '../../utils/formatters';

const ROLE_COLORS = {
  STUDENT: { bg: COLORS.depaul.lightBlue, text: COLORS.depaul.blue },
  ORG:     { bg: COLORS.brand[100], text: COLORS.brand[700] },
  ADMIN:   { bg: '#f3e8ff', text: '#6d28d9' },
};

export default function ProfileScreen() {
  const { user, org, logout } = useAuth();
  const [aboutModal, setAboutModal]   = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);

  const roleColor = ROLE_COLORS[user?.role] || ROLE_COLORS.STUDENT;
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  const orgStatus     = org?.verificationStatus;
  const orgStatusInfo = orgStatus ? getStatusInfo(orgStatus) : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.screenTitle}>Profile</Text>

        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
          <Text style={styles.fullName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleColor.bg }]}>
            <Text style={[styles.roleText, { color: roleColor.text }]}>{user?.role}</Text>
          </View>
        </View>

        {user?.role === 'ORG' && org && (
          <View style={styles.orgCard}>
            <Text style={styles.cardTitle}>Organization</Text>
            <Text style={styles.orgName}>{org.orgName}</Text>
            <Text style={styles.orgMeta}>{getOrgTypeLabel(org.orgType)}</Text>
            {orgStatusInfo && (
              <View style={[styles.statusBadge, { backgroundColor: orgStatusInfo.bg, marginTop: SPACING.sm }]}>
                <Text style={[styles.statusText, { color: orgStatusInfo.text }]}>
                  {orgStatus === 'PENDING'
                    ? '⏳ Pending admin verification'
                    : orgStatus === 'VERIFIED'
                    ? '✓ Verified'
                    : '✕ Verification declined'}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuRow} onPress={() => setAboutModal(true)}>
            <Ionicons name="information-circle-outline" size={22} color={COLORS.gray[600]} />
            <Text style={styles.menuLabel}>About This App</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.gray[300]} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuRow, styles.menuRowLast]} onPress={() => setLogoutModal(true)}>
            <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
            <Text style={[styles.menuLabel, { color: COLORS.error }]}>Log Out</Text>
            <Ionicons name="chevron-forward" size={18} color={COLORS.gray[300]} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout confirmation modal */}
      <Modal visible={logoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Ionicons name="log-out-outline" size={36} color={COLORS.error} style={{ marginBottom: SPACING.md, alignSelf: 'center' }} />
            <Text style={styles.modalTitle}>Log out?</Text>
            <Text style={styles.modalBody}>You will be returned to the login screen.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setLogoutModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                <Text style={styles.logoutBtnText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* About modal */}
      <Modal visible={aboutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>🎁 Free Stuff on Campus</Text>
            <Text style={styles.modalBody}>MIS 360 — Group 4</Text>
            <Text style={styles.modalBody}>DePaul University</Text>
            <Text style={styles.modalBody}>A prototype platform for DePaul students to discover free items shared by student organizations, departments, and faculty.</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setAboutModal(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg.secondary },
  container: { padding: SPACING.base, paddingBottom: SPACING['2xl'] },
  screenTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.gray[900],
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  avatarSection: { alignItems: 'center', marginBottom: SPACING.xl },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.depaul.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  initials: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.white },
  fullName: { fontSize: FONTS.sizes.xl, fontWeight: '700', color: COLORS.gray[900], marginBottom: 4 },
  email: { fontSize: FONTS.sizes.sm, color: COLORS.gray[500], marginBottom: SPACING.sm },
  roleBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  roleText: { fontSize: FONTS.sizes.sm, fontWeight: '700' },
  orgCard: {
    ...CARD_STYLE,
    marginBottom: SPACING.base,
  },
  cardTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.gray[500],
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  orgName: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.gray[900] },
  orgMeta: { fontSize: FONTS.sizes.sm, color: COLORS.gray[500], marginTop: 4 },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    alignSelf: 'flex-start',
  },
  statusText: { fontSize: FONTS.sizes.sm, fontWeight: '600' },
  menu: { ...CARD_STYLE, padding: 0, overflow: 'hidden' },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
    gap: SPACING.md,
  },
  menuRowLast: { borderBottomWidth: 0 },
  menuLabel: {
    flex: 1,
    fontSize: FONTS.sizes.base,
    color: COLORS.gray[700],
    fontWeight: '500',
  },
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
  modalTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: FONTS.sizes.base,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.base,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.gray[300],
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.gray[700],
    fontWeight: '600',
    fontSize: FONTS.sizes.base,
  },
  logoutBtn: {
    flex: 1,
    backgroundColor: COLORS.error,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONTS.sizes.base,
  },
  closeBtn: {
    marginTop: SPACING.base,
    backgroundColor: COLORS.brand[600],
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  closeBtnText: { color: COLORS.white, fontWeight: '700', fontSize: FONTS.sizes.base },
});
