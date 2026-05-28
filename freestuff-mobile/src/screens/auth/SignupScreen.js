import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { authAPI } from '../../services/api';
import {
  COLORS, FONTS, SPACING, RADIUS, INPUT_STYLE, BTN_PRIMARY, BTN_SECONDARY, CARD_STYLE,
} from '../../constants/theme';

const ORG_TYPES = [
  { value: 'STUDENT_ORG',    label: 'Student Org' },
  { value: 'UNIV_DEPT',      label: 'University Department' },
  { value: 'FACULTY_STAFF',  label: 'Faculty & Staff' },
];

export default function SignupScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (val) => {
    if (val && !val.toLowerCase().endsWith('@depaul.edu')) {
      setErrors(e => ({ ...e, email: 'Please use your @depaul.edu email address' }));
    } else {
      setErrors(e => ({ ...e, email: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!firstName.trim()) errs.firstName = 'First name is required';
    if (!lastName.trim()) errs.lastName = 'Last name is required';
    if (!email.toLowerCase().endsWith('@depaul.edu')) errs.email = 'Please use your @depaul.edu email address';
    if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (accountType === 'ORG') {
      if (!orgName.trim()) errs.orgName = 'Organization name is required';
      if (!orgType) errs.orgType = 'Please select an organization type';
      if (!contactEmail.trim()) errs.contactEmail = 'Contact email is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password,
        accountType,
        ...(accountType === 'ORG' ? {
          orgName: orgName.trim(),
          orgType,
          contactEmail: contactEmail.trim(),
        } : {}),
      };
      await authAPI.signup(payload);
      Toast.show({
        type: 'success',
        text1: 'Account created!',
        text2: 'Please log in with your new account.',
      });
      navigation.navigate('Login');
    } catch (err) {
      const msg = err.response?.data?.error || '';
      if (err.response?.status === 409) {
        setErrors(e => ({ ...e, email: 'An account with this email already exists.' }));
      } else {
        setErrors(e => ({ ...e, general: msg || 'Something went wrong. Please try again.' }));
      }
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.container}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.gray[700]} />
          </TouchableOpacity>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Choose your account type</Text>

          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[styles.typeCard, accountType === 'STUDENT' && styles.typeCardActive]}
              onPress={() => setAccountType('STUDENT')}
            >
              <Text style={styles.typeEmoji}>🎓</Text>
              <Text style={[styles.typeLabel, accountType === 'STUDENT' && styles.typeLabelActive]}>
                Student Account
              </Text>
              <Text style={styles.typeDesc}>Browse listings, save items, get notifications</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeCard, accountType === 'ORG' && styles.typeCardActive]}
              onPress={() => setAccountType('ORG')}
            >
              <Text style={styles.typeEmoji}>🏢</Text>
              <Text style={[styles.typeLabel, accountType === 'ORG' && styles.typeLabelActive]}>
                Organization / Dept
              </Text>
              <Text style={styles.typeDesc}>Post free item giveaways for students</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[BTN_PRIMARY, !accountType && styles.btnDisabled]}
            disabled={!accountType}
            onPress={() => setStep(2)}
          >
            <Text style={styles.btnText}>Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => setStep(1)}>
            <Ionicons name="arrow-back" size={24} color={COLORS.gray[700]} />
          </TouchableOpacity>
          <Text style={styles.title}>{accountType === 'STUDENT' ? '🎓 Student Account' : '🏢 Organization Account'}</Text>

          {errors.general ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errors.general}</Text>
            </View>
          ) : null}

          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={[styles.input, errors.firstName && styles.inputError]}
                placeholder="First name"
                placeholderTextColor={COLORS.gray[400]}
                value={firstName}
                onChangeText={setFirstName}
              />
              {errors.firstName ? <Text style={styles.fieldError}>{errors.firstName}</Text> : null}
            </View>
            <View style={styles.nameField}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                placeholder="Last name"
                placeholderTextColor={COLORS.gray[400]}
                value={lastName}
                onChangeText={setLastName}
              />
              {errors.lastName ? <Text style={styles.fieldError}>{errors.lastName}</Text> : null}
            </View>
          </View>

          <Text style={styles.label}>DePaul Email</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="you@depaul.edu"
            placeholderTextColor={COLORS.gray[400]}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            onBlur={() => validateEmail(email)}
          />
          {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            placeholder="Minimum 8 characters"
            placeholderTextColor={COLORS.gray[400]}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={[styles.input, errors.confirmPassword && styles.inputError]}
            placeholder="Repeat password"
            placeholderTextColor={COLORS.gray[400]}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          {errors.confirmPassword ? <Text style={styles.fieldError}>{errors.confirmPassword}</Text> : null}

          {accountType === 'ORG' && (
            <>
              <View style={styles.infoBanner}>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.warning} />
                <Text style={styles.infoText}>
                  Organization accounts require admin verification before you can post listings. This usually takes 24 hours.
                </Text>
              </View>

              <Text style={styles.label}>Organization Name</Text>
              <TextInput
                style={[styles.input, errors.orgName && styles.inputError]}
                placeholder="e.g. DePaul Robotics Club"
                placeholderTextColor={COLORS.gray[400]}
                value={orgName}
                onChangeText={setOrgName}
              />
              {errors.orgName ? <Text style={styles.fieldError}>{errors.orgName}</Text> : null}

              <Text style={styles.label}>Organization Type</Text>
              <View style={styles.orgTypeRow}>
                {ORG_TYPES.map(t => (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.orgTypeBtn, orgType === t.value && styles.orgTypeBtnActive]}
                    onPress={() => setOrgType(t.value)}
                  >
                    <Text style={[styles.orgTypeBtnText, orgType === t.value && styles.orgTypeBtnTextActive]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.orgType ? <Text style={styles.fieldError}>{errors.orgType}</Text> : null}

              <Text style={styles.label}>Contact Email</Text>
              <TextInput
                style={[styles.input, errors.contactEmail && styles.inputError]}
                placeholder="Contact email for your org"
                placeholderTextColor={COLORS.gray[400]}
                keyboardType="email-address"
                autoCapitalize="none"
                value={contactEmail}
                onChangeText={setContactEmail}
              />
              {errors.contactEmail ? <Text style={styles.fieldError}>{errors.contactEmail}</Text> : null}
            </>
          )}

          <TouchableOpacity
            style={[BTN_PRIMARY, { marginTop: SPACING.lg }, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.btnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backToLogin} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backToLoginText}>Already have an account? Log in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: SPACING.xl, paddingTop: SPACING.lg },
  back: { marginBottom: SPACING.lg },
  title: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: '800',
    color: COLORS.gray[900],
    marginBottom: SPACING.xs,
  },
  subtitle: { fontSize: FONTS.sizes.base, color: COLORS.gray[500], marginBottom: SPACING.xl },
  typeRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  typeCard: {
    flex: 1,
    padding: SPACING.base,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  typeCardActive: {
    borderColor: COLORS.brand[600],
    backgroundColor: COLORS.brand[50],
  },
  typeEmoji: { fontSize: 32, marginBottom: SPACING.sm },
  typeLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '700',
    color: COLORS.gray[700],
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  typeLabelActive: { color: COLORS.brand[700] },
  typeDesc: { fontSize: FONTS.sizes.xs, color: COLORS.gray[500], textAlign: 'center' },
  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: SPACING.xs,
    marginTop: SPACING.md,
  },
  input: { ...INPUT_STYLE, marginBottom: 0 },
  inputError: { borderColor: COLORS.error },
  nameRow: { flexDirection: 'row', gap: SPACING.sm },
  nameField: { flex: 1 },
  fieldError: { fontSize: FONTS.sizes.xs, color: COLORS.error, marginTop: 4, marginBottom: 4 },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#fef9c3',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  infoText: { fontSize: FONTS.sizes.sm, color: '#854d0e', flex: 1, lineHeight: 18 },
  orgTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xs },
  orgTypeBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.gray[300],
  },
  orgTypeBtnActive: { borderColor: COLORS.brand[600], backgroundColor: COLORS.brand[50] },
  orgTypeBtnText: { fontSize: FONTS.sizes.sm, color: COLORS.gray[600], fontWeight: '500' },
  orgTypeBtnTextActive: { color: COLORS.brand[700], fontWeight: '700' },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorBannerText: { color: COLORS.error, fontSize: FONTS.sizes.sm },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '700' },
  backToLogin: { alignItems: 'center', marginTop: SPACING.lg, paddingBottom: SPACING.xl },
  backToLoginText: { color: COLORS.depaul.blue, fontSize: FONTS.sizes.sm, fontWeight: '600' },
});
