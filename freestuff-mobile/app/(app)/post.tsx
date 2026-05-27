import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { apiRequest } from '@/lib/queryClient';

const CATS = [
  { id: 'FOOD', label: 'Food', icon: 'pizza-outline' as const },
  { id: 'DRINKS', label: 'Drinks', icon: 'cafe-outline' as const },
  { id: 'APPAREL', label: 'Merch', icon: 'shirt-outline' as const },
  { id: 'SUPPLIES', label: 'Supplies', icon: 'book-outline' as const },
  { id: 'OTHER', label: 'Other', icon: 'gift-outline' as const },
];

const DURATIONS = [
  { label: '1h', hours: 1 },
  { label: '2h', hours: 2 },
  { label: '4h', hours: 4 },
  { label: '8h', hours: 8 },
  { label: '24h', hours: 24 },
];

export default function PostScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const botPad = insets.bottom + (Platform.OS === 'web' ? 34 : 0);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('FOOD');
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(2);
  const [isLoading, setIsLoading] = useState(false);

  const handlePost = async () => {
    if (!title.trim()) { Alert.alert('Required', 'Please enter a title.'); return; }
    if (!building.trim()) { Alert.alert('Required', 'Please enter the building name.'); return; }
    setIsLoading(true);
    try {
      const endTime = new Date(Date.now() + duration * 3600 * 1000).toISOString();
      await apiRequest('POST', '/api/listings', {
        title: title.trim(),
        category,
        buildingName: building.trim(),
        roomOrFloor: room.trim() || undefined,
        description: description.trim() || undefined,
        endTime,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      qc.invalidateQueries({ queryKey: ['/api/listings/mine'] });
      setTitle(''); setBuilding(''); setRoom(''); setDescription(''); setDuration(2);
      Alert.alert('Submitted!', 'Your listing is pending admin approval.');
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', err?.response?.data?.message ?? 'Could not post listing. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const label = (id: string) => CATS.find(c => c.id === id)?.label ?? id;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Post a Listing</Text>
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: botPad + 24 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>TITLE</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
          placeholder="e.g. Free pizza from club meeting"
          placeholderTextColor={colors.mutedForeground}
          value={title}
          onChangeText={setTitle}
          returnKeyType="next"
          maxLength={80}
        />

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CATEGORY</Text>
        <View style={styles.catGrid}>
          {CATS.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.catBtn,
                { backgroundColor: colors.muted },
                category === c.id && { backgroundColor: colors.foreground },
              ]}
              onPress={() => setCategory(c.id)}
            >
              <Ionicons name={c.icon} size={18} color={category === c.id ? colors.background : colors.mutedForeground} />
              <Text style={[styles.catTxt, { color: category === c.id ? colors.background : colors.foreground }]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>LOCATION</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
          placeholder="Building name (e.g. DePaul Center)"
          placeholderTextColor={colors.mutedForeground}
          value={building}
          onChangeText={setBuilding}
          returnKeyType="next"
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground }]}
          placeholder="Room / floor (optional)"
          placeholderTextColor={colors.mutedForeground}
          value={room}
          onChangeText={setRoom}
          returnKeyType="next"
        />

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>AVAILABLE FOR</Text>
        <View style={styles.durationRow}>
          {DURATIONS.map(d => (
            <TouchableOpacity
              key={d.hours}
              style={[
                styles.durBtn,
                { backgroundColor: colors.muted },
                duration === d.hours && { backgroundColor: colors.primary },
              ]}
              onPress={() => setDuration(d.hours)}
            >
              <Text style={[styles.durTxt, { color: duration === d.hours ? '#fff' : colors.foreground }]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DESCRIPTION (optional)</Text>
        <TextInput
          style={[styles.input, styles.textarea, { backgroundColor: colors.muted, color: colors.foreground }]}
          placeholder="Any extra details..."
          placeholderTextColor={colors.mutedForeground}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary }, isLoading && { opacity: 0.6 }]}
          onPress={handlePost}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading
            ? <ActivityIndicator color="#fff" />
            : (
              <>
                <Ionicons name="paper-plane-outline" size={18} color="#fff" />
                <Text style={styles.submitTxt}>Submit for Review</Text>
              </>
            )
          }
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 26, fontWeight: '700', fontFamily: 'DM_Sans_700Bold' },
  content: { paddingHorizontal: 16, gap: 10 },
  sectionLabel: {
    fontSize: 11, fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold',
    letterSpacing: 0.8, marginTop: 6,
  },
  input: {
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, fontFamily: 'DM_Sans_400Regular',
  },
  textarea: { height: 100, paddingTop: 14 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
  },
  catTxt: { fontSize: 14, fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold' },
  durationRow: { flexDirection: 'row', gap: 8 },
  durBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  durTxt: { fontSize: 14, fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold' },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 12, paddingVertical: 14, marginTop: 8,
  },
  submitTxt: { color: '#fff', fontSize: 15, fontWeight: '600', fontFamily: 'DM_Sans_600SemiBold' },
});
