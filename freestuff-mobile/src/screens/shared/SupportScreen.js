import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Linking, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, CARD_STYLE } from '../../constants/theme';

const ADMIN_EMAIL = 'admin@depaul.edu';

export default function SupportScreen({ navigation }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (Platform.OS === 'web' && navigator?.clipboard) {
        await navigator.clipboard.writeText(ADMIN_EMAIL);
      }
      // On native: clipboard not available without extra package — just show the feedback
    } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${ADMIN_EMAIL}?subject=Free Stuff on Campus — Support`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.title}>Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="help-buoy-outline" size={40} color={COLORS.brand[600]} />
        </View>
        <Text style={styles.heading}>Need help?</Text>
        <Text style={styles.body}>
          This is a prototype app built by DePaul MIS 360 — Group 4.
          If you run into any issues, have questions, or want to report a problem,
          reach out to the admin directly.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Admin Contact</Text>
          <View style={styles.emailRow}>
            <Ionicons name="mail-outline" size={20} color={COLORS.depaul.blue} />
            <Text style={styles.emailText} selectable>{ADMIN_EMAIL}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
              <Ionicons
                name={copied ? 'checkmark-circle-outline' : 'copy-outline'}
                size={18}
                color={copied ? COLORS.brand[600] : COLORS.gray[600]}
              />
              <Text style={[styles.copyBtnText, copied && styles.copyBtnTextDone]}>
                {copied ? 'Copied!' : 'Copy Email'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mailBtn} onPress={handleEmail}>
              <Ionicons name="send-outline" size={18} color={COLORS.white} />
              <Text style={styles.mailBtnText}>Open Mail App</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About This App</Text>
          <Text style={styles.infoLine}>📋  MIS 360 — Group 4</Text>
          <Text style={styles.infoLine}>🏫  DePaul University</Text>
          <Text style={styles.infoLine}>🎁  Free Stuff on Campus Prototype</Text>
          <Text style={styles.infoLine}>⚠️  For testing purposes only</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg.secondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  backBtn: { padding: 4 },
  title: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.gray[900] },
  content: { flex: 1, padding: SPACING.base, alignItems: 'center' },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.brand[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.base,
  },
  heading: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.gray[900],
    marginBottom: SPACING.sm,
  },
  body: {
    fontSize: FONTS.sizes.base,
    color: COLORS.gray[500],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
    maxWidth: 340,
  },
  card: { ...CARD_STYLE, width: '100%', maxWidth: 400 },
  cardLabel: {
    fontSize: FONTS.sizes.xs,
    fontWeight: '700',
    color: COLORS.gray[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.base,
  },
  emailText: {
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
    color: COLORS.depaul.blue,
  },
  actions: { flexDirection: 'row', gap: SPACING.md },
  copyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
  },
  copyBtnText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.gray[600] },
  copyBtnTextDone: { color: COLORS.brand[600] },
  mailBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.depaul.blue,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
  },
  mailBtnText: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.white },
  divider: { height: 1, backgroundColor: COLORS.gray[200], width: '100%', maxWidth: 400, marginVertical: SPACING.xl },
  infoCard: { ...CARD_STYLE, width: '100%', maxWidth: 400 },
  infoTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  infoLine: {
    fontSize: FONTS.sizes.base,
    color: COLORS.gray[700],
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
});
