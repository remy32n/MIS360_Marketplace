import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { useColors } from '@/hooks/useColors';

type AccountType = 'STUDENT' | 'ORG';

const ORG_TYPES = ['Student Org', 'University Department', 'Faculty & Staff'];

export default function SignupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signup } = useAuth();
  const [accountType, setAccountType] = useState<AccountType>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showOrgTypePicker, setShowOrgTypePicker] = useState(false);

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);

  const handleSignup = async () => {
    if (!email.endsWith('@depaul.edu')) {
      Alert.alert('Invalid Email', 'Please use your @depaul.edu email address.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters.');
      return;
    }
    if (accountType === 'ORG') {
      if (!orgName.trim()) { Alert.alert('Required', 'Please enter your organization name.'); return; }
      if (!orgType) { Alert.alert('Required', 'Please select an organization type.'); return; }
    }
    setIsLoading(true);
    try {
      await signup({
        email: email.trim().toLowerCase(),
        password,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        accountType,
        ...(accountType === 'ORG' ? {
          orgName: orgName.trim(),
          orgType,
          contactEmail: contactEmail.trim() || undefined,
        } : {}),
      });
      Alert.alert('Account created!', 'Please log in to continue.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (err: any) {
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
        contentContainerStyle={[styles.content, { paddingTop: topPad + 24, paddingBottom: 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color={colors.foreground} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.foreground }]}>Create account</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Join the DePaul free stuff community
        </Text>

        {/* Account type toggle */}
        <View style={[styles.toggle, { backgroundColor: colors.muted }]}>
          {(['STUDENT', 'ORG'] as AccountType[]).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.toggleBtn, accountType === t && { backgroundColor: colors.background }]}
              onPress={() => setAccountType(t)}
            >
              <Ionicons
                name={t === 'STUDENT' ? 'school-outline' : 'business-outline'}
                size={15}
                color={accountType === t ? colors.foreground : colors.mutedForeground}
              />
              <Text style={[styles.toggleTxt, { color: accountType === t ? colors.foreground : colors.mutedForeground }]}>
                {t === 'STUDENT' ? 'Student' : 'Organization'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {accountType === 'ORG' && (
          <View style={[styles.infoBox, { backgroundColor: '#fef9c3' }]}>
            <Ionicons name="information-circle-outline" size={16} color="#854d0e" />
            <Text style={[styles.infoTxt, { color: '#854d0e' }]}>
              Organization accounts require admin verification before posting. This usually takes 24 hours.
            </Text>
          </View>
        )}

        {/* Basic fields */}
        <View style={styles.nameRow}>
          <TextInput
            style={[styles.input, styles.nameInput, { backgroundColor: colors.muted, color: colors.foreground }]}
            placeholder="First name"
            placeholderTextColor={colors.mutedForeground}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            returnKeyType="next"
          />
          <TextInput
            style={[styles.input, styles.nameInput, { backgroundColor: colors.muted, color: colors.foreground }]}
            placeholder="Last name"
            placeholderTextColor={colors.mutedForeground}
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

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
            placeholder="Password (min. 8 characters)"
            placeholderTextColor={colors.mutedForeground}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            autoComplete="new-password"
            returnKeyType="next"
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
            <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Org fields */}
        {accountType === 'ORG' && (
          <>
            <View style={[styles.divider, { borderTopColor: colors.border }]} />

            <TextInput
              style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
              placeholder="Organization name"
              placeholderTextColor={colors.mutedForeground}
              value={orgName}
              onChangeText={setOrgName}
              returnKeyType="next"
            />

            <TouchableOpacity
              style={[styles.input, styles.selectBtn, { backgroundColor: colors.muted }]}
              onPress={() => setShowOrgTypePicker(!showOrgTypePicker)}
            >
              <Text style={[styles.selectTxt, { color: orgType ? colors.foreground : colors.mutedForeground }]}>
                {orgType || 'Select organization type'}
              </Text>
              <Ionicons name="chevron-down-outline" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>

            {showOrgTypePicker && (
              <View style={[styles.picker, { backgroundColor: colors.background, borderColor: colors.border }]}>
                {ORG_TYPES.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.pickerItem, { borderBottomColor: colors.border }]}
                    onPress={() => { setOrgType(t); setShowOrgTypePicker(false); }}
                  >
                    <Text style={[styles.pickerItemTxt, { color: colors.foreground }, orgType === t && { color: colors.primary }]}>
                      {t}
                    </Text>
                    {orgType === t && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TextInput
              style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
              placeholder="Public contact email (optional)"
              placeholderTextColor={colors.mutedForeground}
              value={contactEmail}
              onChangeText={setContactEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="done"
              onSubmitEditing={handleSignup}
            />
          </>
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
  content: { paddingHorizontal: 24, gap: 12 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '700' },
  sub: { fontSize: 14, marginTop: -4 },
  toggle: { flexDirection: 'row', borderRadius: 12, padding: 4, gap: 4 },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10,
  },
  toggleTxt: { fontSize: 14, fontWeight: '600' },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    padding: 12, borderRadius: 10, marginTop: 0,
  },
  infoTxt: { fontSize: 13, flex: 1, lineHeight: 18 },
  nameRow: { flexDirection: 'row', gap: 10 },
  nameInput: { flex: 1 },
  passWrap: { position: 'relative' },
  input: {
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
  },
  eyeBtn: { position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center' },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, marginVertical: 4 },
  selectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectTxt: { fontSize: 15 },
  picker: {
    borderRadius: 12, borderWidth: 1, overflow: 'hidden', marginTop: -8,
  },
  pickerItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerItemTxt: { fontSize: 15 },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  loginText: { fontSize: 14, textAlign: 'center' },
  loginLink: { fontWeight: '600' },
});
