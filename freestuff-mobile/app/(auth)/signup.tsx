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

type AccountType = 'STUDENT' | 'ORG';

export default function SignupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signup } = useAuth();
  const [accountType, setAccountType] = useState<AccountType>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  const handleSignup = async () => {
    if (!email.endsWith('@depaul.edu')) {
      Alert.alert('Invalid Email', 'Please use your @depaul.edu email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (accountType === 'ORG' && !orgName.trim()) {
      Alert.alert('Required', 'Please enter your organization name.');
      return;
    }
    setIsLoading(true);
    try {
      await signup({
        email: email.trim().toLowerCase(),
        password,
        accountType,
        ...(accountType === 'ORG' ? { orgName: orgName.trim() } : {}),
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(app)');
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Signup Failed', err?.response?.data?.message ?? 'Could not create account. Please try again.');
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
        contentContainerStyle={[styles.content, { paddingTop: topPad + 24, paddingBottom: botPad + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color={colors.foreground} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.foreground }]}>Create account</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Join the DePaul free stuff community
        </Text>

        {/* Role toggle */}
        <View style={[styles.toggle, { backgroundColor: colors.muted }]}>
          {(['STUDENT', 'ORG'] as AccountType[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.toggleBtn, accountType === t && { backgroundColor: colors.background }]}
              onPress={() => setAccountType(t)}
            >
              <Ionicons
                name={t === 'STUDENT' ? 'school-outline' : 'business-outline'}
                size={16}
                color={accountType === t ? colors.foreground : colors.mutedForeground}
              />
              <Text style={[
                styles.toggleText,
                { color: accountType === t ? colors.foreground : colors.mutedForeground },
              ]}>
                {t === 'STUDENT' ? 'Student' : 'Organization'}
              </Text>
            </TouchableOpacity>
          ))}
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
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
            placeholder="Password (min. 6 characters)"
            placeholderTextColor={colors.mutedForeground}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            returnKeyType="next"
          />
          {accountType === 'ORG' && (
            <TextInput
              style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
              placeholder="Organization name"
              placeholderTextColor={colors.mutedForeground}
              value={orgName}
              onChangeText={setOrgName}
              returnKeyType="done"
              onSubmitEditing={handleSignup}
            />
          )}

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary }, isLoading && styles.btnDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Create Account</Text>
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.loginText, { color: colors.mutedForeground }]}>
            Already have an account?{'  '}
            <Text style={[styles.loginLink, { color: colors.primary }]}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 24, gap: 20 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '700', fontFamily: 'DM_Sans_700Bold' },
  sub: { fontSize: 14, fontFamily: 'DM_Sans_400Regular', marginTop: -10 },
  toggle: {
    flexDirection: 'row', borderRadius: 12, padding: 4, gap: 4,
  },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10,
  },
  toggleText: { fontSize: 14, fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold' },
  form: { gap: 12 },
  input: {
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, fontFamily: 'DM_Sans_400Regular',
  },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold' },
  loginText: { fontSize: 14, fontFamily: 'DM_Sans_400Regular', textAlign: 'center' },
  loginLink: { fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold' },
});
