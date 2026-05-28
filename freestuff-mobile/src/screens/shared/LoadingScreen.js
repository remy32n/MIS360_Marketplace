import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../constants/theme';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🎁</Text>
      <ActivityIndicator size="large" color={COLORS.depaul.blue} style={styles.spinner} />
      <Text style={styles.title}>Free Stuff</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: { fontSize: 56, marginBottom: 24 },
  spinner: { marginBottom: 16 },
  title: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: '800',
    color: COLORS.gray[800],
  },
});
