import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/hooks/useAuth';
import { useColors } from '@/hooks/useColors';

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  const handleLogin = async () => {
    if (!email.endsWith('@depaul.edu')) {
      Alert.alert('Invalid Email', 'Please use your @depaul.edu email address.');
      return;
    }
    if (!password) {
      Alert.alert('Required', 'Please enter your password.');
      return;
    }
    setIsLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(app)');
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Login Failed', err?.response?.data?.message ?? 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad + 40, paddingBottom: botPad + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logo}>
          <View style={[styles.iconWrap, { backgroundColor: colors.muted }]}>
            <Ionicons name="gift-outline" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Free Stuff</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            Free giveaways at DePaul University
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            placeholder="name@depaul.edu"
            placeholderTextColor={colors.mutedForeground}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="next"
          />

          <View style={styles.passWrap}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, paddingRight: 50 }]}
              placeholder="Password"
              placeholderTextColor={colors.mutedForeground}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              autoComplete="current-password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary }, isLoading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Log In</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divRow}>
          <View style={[styles.divLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.divLabel, { color: colors.mutedForeground }]}>OR</Text>
          <View style={[styles.divLine, { backgroundColor: colors.border }]} />
        </View>

        <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
          <Text style={[styles.signupText, { color: colors.mutedForeground }]}>
            Don't have an account?{'  '}
            <Text style={[styles.signupLink, { color: colors.primary }]}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { alignItems: 'center', paddingHorizontal: 32, gap: 28 },
  logo: { alignItems: 'center', gap: 10 },
  iconWrap: {
    width: 80, height: 80, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 28, fontWeight: '700', fontFamily: 'DM_Sans_700Bold' },
  sub: { fontSize: 14, fontFamily: 'DM_Sans_400Regular', textAlign: 'center' },
  form: { width: '100%', gap: 12 },
  passWrap: { position: 'relative' },
  input: {
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, fontFamily: 'DM_Sans_400Regular',
  },
  eyeBtn: {
    position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center',
  },
  btn: {
    borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold' },
  divRow: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%' },
  divLine: { flex: 1, height: StyleSheet.hairlineWidth },
  divLabel: { fontSize: 12, fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold', letterSpacing: 1 },
  signupText: { fontSize: 14, fontFamily: 'DM_Sans_400Regular' },
  signupLink: { fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold' },
});
