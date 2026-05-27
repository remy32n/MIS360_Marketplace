import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/hooks/useAuth';

const ROLE_LABELS: Record<string, string> = {
  STUDENT: 'Student',
  ORG: 'Organization',
  ADMIN: 'Administrator',
};

const ROLE_COLORS: Record<string, string> = {
  STUDENT: '#0095f6',
  ORG: '#8b5cf6',
  ADMIN: '#ef4444',
};

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  if (!user) return null;

  const roleColor = ROLE_COLORS[user.role] ?? colors.primary;
  const roleLabel = ROLE_LABELS[user.role] ?? user.role;

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 24, paddingBottom: botPad + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: roleColor + '20' }]}>
          <Ionicons
            name={user.role === 'STUDENT' ? 'school' : user.role === 'ORG' ? 'business' : 'shield-checkmark'}
            size={48}
            color={roleColor}
          />
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>
          {user.orgName ?? user.email.split('@')[0]}
        </Text>
        <Text style={[styles.email, { color: colors.mutedForeground }]}>{user.email}</Text>
        <View style={[styles.rolePill, { backgroundColor: roleColor + '20' }]}>
          <Text style={[styles.roleText, { color: roleColor }]}>{roleLabel}</Text>
        </View>
      </View>

      {/* Info rows */}
      <View style={[styles.section, { borderColor: colors.border }]}>
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <Ionicons name="mail-outline" size={18} color={colors.mutedForeground} />
          <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Email</Text>
          <Text style={[styles.infoValue, { color: colors.foreground }]} numberOfLines={1}>
            {user.email}
          </Text>
        </View>
        {user.orgName && (
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Ionicons name="business-outline" size={18} color={colors.mutedForeground} />
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Organization</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]} numberOfLines={1}>
              {user.orgName}
            </Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={18} color={colors.mutedForeground} />
          <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Role</Text>
          <Text style={[styles.infoValue, { color: colors.foreground }]}>{roleLabel}</Text>
        </View>
      </View>

      {/* About */}
      <View style={[styles.section, { borderColor: colors.border }]}>
        <View style={styles.aboutRow}>
          <Ionicons name="gift-outline" size={20} color={colors.primary} />
          <Text style={[styles.aboutTitle, { color: colors.foreground }]}>Free Stuff @ DePaul</Text>
        </View>
        <Text style={[styles.aboutText, { color: colors.mutedForeground }]}>
          Connecting DePaul organizations with students — no waste, just free stuff.
        </Text>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: colors.danger + '40', backgroundColor: colors.danger + '10' }]}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={[styles.logoutText, { color: colors.danger }]}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 20 },
  avatarSection: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  avatar: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  name: { fontSize: 22, fontWeight: '700', fontFamily: 'DM_Sans_700Bold' },
  email: { fontSize: 14, fontFamily: 'DM_Sans_400Regular' },
  rolePill: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginTop: 4 },
  roleText: { fontSize: 13, fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold' },
  section: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 16, overflow: 'hidden' },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoLabel: { fontSize: 14, fontFamily: 'DM_Sans_400Regular', width: 90 },
  infoValue: { fontSize: 14, fontFamily: 'DM_Sans_500Medium', flex: 1, textAlign: 'right' },
  aboutRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, paddingBottom: 8 },
  aboutTitle: { fontSize: 15, fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold' },
  aboutText: { fontSize: 14, fontFamily: 'DM_Sans_400Regular', paddingHorizontal: 16, paddingBottom: 16, lineHeight: 20 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, paddingVertical: 14,
    borderWidth: 1,
  },
  logoutText: { fontSize: 15, fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold' },
});
