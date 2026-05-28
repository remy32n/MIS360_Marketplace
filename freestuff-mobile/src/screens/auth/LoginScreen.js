import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, FONTS, SPACING, RADIUS, INPUT_STYLE, BTN_PRIMARY } from '../../constants/theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = () => {
    if (email && !email.toLowerCase().endsWith('@depaul.edu')) {
      setEmailError('Please use your @depaul.edu email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleLogin = async () => {
    setError('');
    if (!validateEmail()) return;
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.toLowerCase().trim(), password);
      // RootNavigator automatically routes to correct tabs
    } catch (err) {
      const msg = err.response?.data?.error || '';
      if (err.response?.status === 403) {
        setError('This account has been deactivated.');
      } else if (err.response?.status === 401 || err.response?.status === 400) {
        setError('Invalid email or password.');
      } else if (!err.response) {
        setError('Unable to connect. Check your connection.');
      } else {
        setError(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>🎁</Text>
            <Text style={styles.title}>Free Stuff on Campus</Text>
            <Text style={styles.subtitle}>DePaul University — @depaul.edu accounts only</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>DePaul Email</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder="you@depaul.edu"
              placeholderTextColor={COLORS.gray[400]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              onBlur={validateEmail}
            />
            {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}

            <Text style={[styles.label, { marginTop: SPACING.md }]}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
                placeholderTextColor={COLORS.gray[400]}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(v => !v)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={COLORS.gray[400]}
                />
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
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.btnText}>Log In</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotRow} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotLink}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  header: { alignItems: 'center', marginBottom: SPACING['2xl'] },
  logo: { fontSize: 60, marginBottom: SPACING.md },
  title: {
    fontSize: FONTS.sizes['3xl'],
    fontWeight: '800',
    color: COLORS.gray[900],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.gray[500],
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  form: { marginBottom: SPACING.xl },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: SPACING.xs,
  },
  input: { ...INPUT_STYLE, marginBottom: SPACING.xs },
  inputError: { borderColor: COLORS.error },
  passwordRow: { position: 'relative', marginBottom: SPACING.xs },
  passwordInput: { paddingRight: 48, marginBottom: 0 },
  eyeBtn: {
    position: 'absolute',
    right: SPACING.md,
    top: '50%',
    transform: [{ translateY: -11 }],
  },
  fieldError: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.error,
    marginBottom: SPACING.xs,
  },
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
  btn: {
    ...BTN_PRIMARY,
    marginTop: SPACING.md,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '700' },
  forgotRow: { alignItems: 'center', marginTop: SPACING.sm },
  forgotLink: { color: COLORS.gray[500], fontSize: FONTS.sizes.sm, fontWeight: '500' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  footerText: { color: COLORS.gray[500], fontSize: FONTS.sizes.sm },
  signupLink: { color: COLORS.depaul.blue, fontWeight: '700', fontSize: FONTS.sizes.sm },
});
