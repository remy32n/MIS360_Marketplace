import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../../services/api';
import { COLORS, FONTS, SPACING, RADIUS, INPUT_STYLE, BTN_PRIMARY } from '../../constants/theme';

const STEP_EMAIL    = 'email';
const STEP_PASSWORD = 'password';
const STEP_DONE     = 'done';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep]               = useState(STEP_EMAIL);
  const [email, setEmail]             = useState('');
  const [firstName, setFirstName]     = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPw, setConfirmPw]     = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  // ── Step 1: look up email ──────────────────────────────────────────────
  const handleLookup = async () => {
    setError('');
    const trimmed = email.toLowerCase().trim();
    if (!trimmed.endsWith('@depaul.edu')) {
      setError('Please use your @depaul.edu email address.');
      return;
    }
    setLoading(true);
    try {
      const data = await authAPI.lookupEmail(trimmed);
      setFirstName(data.firstName);
      setStep(STEP_PASSWORD);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No account found with that email address.');
      } else {
        setError('Unable to connect. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: reset password ─────────────────────────────────────────────
  const handleReset = async () => {
    setError('');
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPw) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(email.toLowerCase().trim(), newPassword);
      setStep(STEP_DONE);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.gray[700]} />
          </TouchableOpacity>

          {/* ── Done state ── */}
          {step === STEP_DONE && (
            <View style={styles.doneBox}>
              <View style={styles.doneIcon}>
                <Ionicons name="checkmark-circle" size={56} color={COLORS.brand[600]} />
              </View>
              <Text style={styles.doneTitle}>Password Reset!</Text>
              <Text style={styles.doneBody}>
                Your password has been updated. You can now log in with your new password.
              </Text>
              <TouchableOpacity
                style={styles.btn}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.btnText}>Back to Log In</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Step 1: email ── */}
          {step === STEP_EMAIL && (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Forgot Password?</Text>
                <Text style={styles.subtitle}>
                  Enter your @depaul.edu email and we'll let you set a new password.
                </Text>
              </View>

              <Text style={styles.label}>DePaul Email</Text>
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="you@depaul.edu"
                placeholderTextColor={COLORS.gray[400]}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={t => { setEmail(t); setError(''); }}
              />

              {error ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleLookup}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color={COLORS.white} />
                  : <Text style={styles.btnText}>Find My Account</Text>}
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 2: new password ── */}
          {step === STEP_PASSWORD && (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Hi, {firstName}!</Text>
                <Text style={styles.subtitle}>
                  Choose a new password for{'\n'}
                  <Text style={styles.emailHighlight}>{email}</Text>
                </Text>
              </View>

              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput, error ? styles.inputError : null]}
                  placeholder="At least 8 characters"
                  placeholderTextColor={COLORS.gray[400]}
                  secureTextEntry={!showPw}
                  value={newPassword}
                  onChangeText={t => { setNewPassword(t); setError(''); }}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(v => !v)}>
                  <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={22} color={COLORS.gray[400]} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { marginTop: SPACING.md }]}>Confirm Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput, error ? styles.inputError : null]}
                  placeholder="Repeat new password"
                  placeholderTextColor={COLORS.gray[400]}
                  secureTextEntry={!showConfirm}
                  value={confirmPw}
                  onChangeText={t => { setConfirmPw(t); setError(''); }}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(v => !v)}>
                  <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={22} color={COLORS.gray[400]} />
                </TouchableOpacity>
              </View>

              {error ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle-outline" size={16} color={COLORS.error} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleReset}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color={COLORS.white} />
                  : <Text style={styles.btnText}>Reset Password</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.changeEmailBtn} onPress={() => { setStep(STEP_EMAIL); setError(''); }}>
                <Text style={styles.changeEmailText}>Use a different email</Text>
              </TouchableOpacity>
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  container: { flexGrow: 1, padding: SPACING.xl, paddingTop: SPACING.lg },
  backBtn: { marginBottom: SPACING.xl, alignSelf: 'flex-start' },
  header: { marginBottom: SPACING.xl },
  title: { fontSize: FONTS.sizes['2xl'], fontWeight: '800', color: COLORS.gray[900], marginBottom: SPACING.sm },
  subtitle: { fontSize: FONTS.sizes.base, color: COLORS.gray[500], lineHeight: 22 },
  emailHighlight: { color: COLORS.depaul.blue, fontWeight: '600' },
  label: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.gray[700], marginBottom: SPACING.xs },
  input: { ...INPUT_STYLE, marginBottom: SPACING.xs },
  inputError: { borderColor: COLORS.error },
  passwordRow: { position: 'relative', marginBottom: SPACING.xs },
  passwordInput: { paddingRight: 48, marginBottom: 0 },
  eyeBtn: { position: 'absolute', right: SPACING.md, top: '50%', transform: [{ translateY: -11 }] },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  errorText: { color: COLORS.error, fontSize: FONTS.sizes.sm, flex: 1 },
  btn: { ...BTN_PRIMARY, marginTop: SPACING.md },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '700', textAlign: 'center' },
  changeEmailBtn: { marginTop: SPACING.base, alignItems: 'center' },
  changeEmailText: { color: COLORS.depaul.blue, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  doneBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: SPACING['3xl'] },
  doneIcon: { marginBottom: SPACING.xl },
  doneTitle: { fontSize: FONTS.sizes['2xl'], fontWeight: '800', color: COLORS.gray[900], marginBottom: SPACING.md },
  doneBody: { fontSize: FONTS.sizes.base, color: COLORS.gray[500], textAlign: 'center', lineHeight: 24, marginBottom: SPACING['2xl'] },
});
