import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../contexts/AuthContext';
import { listingsAPI, usersAPI } from '../../services/api';
import { COLORS, FONTS, SPACING, RADIUS, INPUT_STYLE, BTN_PRIMARY, CARD_STYLE } from '../../constants/theme';
import { formatDateTime } from '../../utils/formatters';

const CATEGORIES = [
  { key: 'FOOD',    emoji: '🍕', label: 'Food' },
  { key: 'DRINKS',  emoji: '🥤', label: 'Drinks' },
  { key: 'APPAREL', emoji: '👕', label: 'Apparel' },
  { key: 'SUPPLIES',emoji: '📚', label: 'Supplies' },
  { key: 'OTHER',   emoji: '🎁', label: 'Other' },
];

function DateTimeField({ label, value, onChangeText }) {
  if (Platform.OS === 'web') {
    return (
      <View style={{ marginBottom: SPACING.xs }}>
        <Text style={styles.label}>{label}</Text>
        <input
          type="datetime-local"
          value={value || ''}
          onChange={e => onChangeText(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1.5px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            color: '#0f172a',
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'inherit',
            cursor: 'pointer',
          }}
        />
      </View>
    );
  }
  return (
    <View style={{ marginBottom: SPACING.xs }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DDTHH:MM (e.g. 2026-12-01T14:00)"
        placeholderTextColor={COLORS.gray[400]}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
      />
      <Text style={styles.helper}>Format: YYYY-MM-DDTHH:MM (24hr)</Text>
    </View>
  );
}

export default function CreateListingScreen({ navigation, route }) {
  const editListing = route?.params?.listing;
  const { org } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState(org?.verificationStatus || 'PENDING');
  const [title, setTitle] = useState(editListing?.title || '');
  const [category, setCategory] = useState(editListing?.category || '');
  const [description, setDescription] = useState(editListing?.description || '');
  const [buildingName, setBuildingName] = useState(editListing?.buildingName || '');
  const [roomOrFloor, setRoomOrFloor] = useState(editListing?.roomOrFloor || '');
  const [startTime, setStartTime] = useState(editListing?.startTime ? editListing.startTime.slice(0,16) : '');
  const [endTime, setEndTime] = useState(editListing?.endTime ? editListing.endTime.slice(0,16) : '');
  const [posterImageUrl, setPosterImageUrl] = useState(editListing?.posterImageUrl || '');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (org?.id) {
      usersAPI.verifyOrgStatus(org.id)
        .then(data => setVerificationStatus(data.verificationStatus))
        .catch(() => setVerificationStatus(org?.verificationStatus || 'PENDING'));
    }
  }, [org?.id]);

  const isDisabled = verificationStatus !== 'VERIFIED';

  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Please enter a title';
    if (!category) errs.category = 'Please select a category';
    if (!description.trim()) errs.description = 'Please add a description';
    if (!buildingName.trim()) errs.buildingName = 'Please enter a building name';
    if (!roomOrFloor.trim()) errs.roomOrFloor = 'Please enter a room or floor';
    if (!startTime) errs.startTime = 'Please set a start time';
    if (!endTime) errs.endTime = 'Please set an end time';
    if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
      errs.endTime = 'End time must be after start time';
    }
    if (posterImageUrl && !posterImageUrl.startsWith('https://')) {
      errs.posterImageUrl = 'Please enter a valid https:// URL';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        description: description.trim(),
        buildingName: buildingName.trim(),
        roomOrFloor: roomOrFloor.trim(),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        ...(posterImageUrl ? { posterImageUrl } : {}),
      };

      let result;
      if (editListing?.id) {
        result = await listingsAPI.update(editListing.id, payload);
        Toast.show({ type: 'success', text1: 'Listing updated!' });
        navigation.goBack();
      } else {
        result = await listingsAPI.create(payload);
        navigation.navigate('ListingSubmitted', { listing: result.listing });
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit listing.';
      if (err.response?.status === 403) {
        Toast.show({ type: 'error', text1: 'Organization not verified.', text2: msg });
      } else {
        Toast.show({ type: 'error', text1: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const VerificationBanner = () => {
    if (verificationStatus === 'VERIFIED') {
      return (
        <View style={[styles.banner, styles.bannerGreen]}>
          <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.brand[600]} />
          <Text style={styles.bannerTextGreen}>✓ Verified Organization — you can post listings</Text>
        </View>
      );
    }
    if (verificationStatus === 'REJECTED') {
      return (
        <View style={[styles.banner, styles.bannerRed]}>
          <Ionicons name="warning-outline" size={18} color={COLORS.error} />
          <Text style={styles.bannerTextRed}>Your organization verification was declined. Contact support.</Text>
        </View>
      );
    }
    return (
      <View style={[styles.banner, styles.bannerYellow]}>
        <Ionicons name="warning-outline" size={18} color="#854d0e" />
        <Text style={styles.bannerTextYellow}>Your organization is pending admin verification. You cannot post listings until verified.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.gray[700]} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editListing ? 'Edit Listing' : 'Post a Giveaway'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <VerificationBanner />

          <Text style={styles.label}>What are you giving away?</Text>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="e.g. Free Celsius drinks, DePaul merch, leftover pizza..."
            placeholderTextColor={COLORS.gray[400]}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
          {errors.title ? <Text style={styles.fieldError}>{errors.title}</Text> : null}

          <Text style={[styles.label, { marginTop: SPACING.md }]}>Category</Text>
          <View style={[styles.categoryRow, errors.category && styles.categoryRowError]}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c.key}
                style={[styles.catChip, category === c.key && styles.catChipActive]}
                onPress={() => setCategory(c.key)}
              >
                <Text style={styles.catEmoji}>{c.emoji}</Text>
                <Text style={[styles.catLabel, category === c.key && styles.catLabelActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.category ? <Text style={styles.fieldError}>{errors.category}</Text> : null}

          <Text style={[styles.label, { marginTop: SPACING.md }]}>Tell students more</Text>
          <TextInput
            style={[styles.input, styles.multilineInput, errors.description && styles.inputError]}
            placeholder="Include quantity, any conditions, what to expect..."
            placeholderTextColor={COLORS.gray[400]}
            value={description}
            onChangeText={setDescription}
            maxLength={500}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
          {errors.description ? <Text style={styles.fieldError}>{errors.description}</Text> : null}

          <Text style={[styles.label, { marginTop: SPACING.md }]}>Building</Text>
          <TextInput
            style={[styles.input, errors.buildingName && styles.inputError]}
            placeholder="e.g. DePaul Center, CDM, Schmitt Academic Center"
            placeholderTextColor={COLORS.gray[400]}
            value={buildingName}
            onChangeText={setBuildingName}
          />
          {errors.buildingName ? <Text style={styles.fieldError}>{errors.buildingName}</Text> : null}

          <Text style={[styles.label, { marginTop: SPACING.md }]}>Room or Floor</Text>
          <TextInput
            style={[styles.input, errors.roomOrFloor && styles.inputError]}
            placeholder="e.g. Room 404, 7th Floor Lounge, Main Lobby"
            placeholderTextColor={COLORS.gray[400]}
            value={roomOrFloor}
            onChangeText={setRoomOrFloor}
          />
          {errors.roomOrFloor ? <Text style={styles.fieldError}>{errors.roomOrFloor}</Text> : null}

          <DateTimeField
            label="Starts"
            value={startTime}
            onChangeText={setStartTime}
            placeholder="e.g. 2025-12-01T14:00"
          />
          {errors.startTime ? <Text style={styles.fieldError}>{errors.startTime}</Text> : null}

          <DateTimeField
            label="Ends"
            value={endTime}
            onChangeText={setEndTime}
            placeholder="e.g. 2025-12-01T17:00"
          />
          {errors.endTime ? <Text style={styles.fieldError}>{errors.endTime}</Text> : null}

          <Text style={[styles.label, { marginTop: SPACING.md }]}>Image URL (optional)</Text>
          <TextInput
            style={[styles.input, errors.posterImageUrl && styles.inputError]}
            placeholder="https://... paste a direct image link"
            placeholderTextColor={COLORS.gray[400]}
            value={posterImageUrl}
            onChangeText={setPosterImageUrl}
            keyboardType="url"
            autoCapitalize="none"
          />
          <Text style={styles.helper}>We store this as a link — no image is downloaded to our server.</Text>
          {errors.posterImageUrl ? <Text style={styles.fieldError}>{errors.posterImageUrl}</Text> : null}

          <TouchableOpacity
            style={[BTN_PRIMARY, styles.submitBtn, (isDisabled || loading) && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={isDisabled || loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitBtnText}>
                {editListing ? 'Save Changes' : 'Submit for Review'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  headerTitle: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.gray[900] },
  form: { padding: SPACING.base, paddingBottom: SPACING['2xl'] },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.base,
    gap: SPACING.sm,
  },
  bannerGreen: { backgroundColor: COLORS.brand[50], borderWidth: 1, borderColor: COLORS.brand[200] },
  bannerYellow: { backgroundColor: '#fef9c3', borderWidth: 1, borderColor: '#fef08a' },
  bannerRed: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  bannerTextGreen: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.brand[700], fontWeight: '500' },
  bannerTextYellow: { flex: 1, fontSize: FONTS.sizes.sm, color: '#854d0e' },
  bannerTextRed: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.error },
  label: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.gray[700], marginBottom: SPACING.xs },
  input: { ...INPUT_STYLE },
  inputError: { borderColor: COLORS.error },
  multilineInput: { height: 120, textAlignVertical: 'top' },
  charCount: { fontSize: FONTS.sizes.xs, color: COLORS.gray[400], textAlign: 'right', marginBottom: SPACING.xs },
  helper: { fontSize: FONTS.sizes.xs, color: COLORS.gray[400], marginBottom: SPACING.xs },
  fieldError: { fontSize: FONTS.sizes.xs, color: COLORS.error, marginBottom: SPACING.sm },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  categoryRowError: { borderWidth: 1.5, borderColor: COLORS.error, borderRadius: RADIUS.md, padding: SPACING.sm },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.gray[300],
    backgroundColor: COLORS.white,
    gap: 4,
  },
  catChipActive: { borderColor: COLORS.brand[600], backgroundColor: COLORS.brand[50] },
  catEmoji: { fontSize: 16 },
  catLabel: { fontSize: FONTS.sizes.sm, color: COLORS.gray[600], fontWeight: '500' },
  catLabelActive: { color: COLORS.brand[700], fontWeight: '700' },
  submitBtn: { marginTop: SPACING.xl },
  submitBtnText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '700' },
  btnDisabled: { opacity: 0.5 },
});
