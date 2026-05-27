import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing,
} from 'react-native-reanimated';

function Bone({ style }: { style?: any }) {
  const op = useSharedValue(1);
  useEffect(() => {
    op.value = withRepeat(
      withTiming(0.35, { duration: 850, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);
  const aStyle = useAnimatedStyle(() => ({ opacity: op.value }));
  return <Animated.View style={[{ backgroundColor: '#e5e7eb', borderRadius: 8 }, style, aStyle]} />;
}

export function ListingCardSkeleton() {
  return (
    <View style={styles.card}>
      <Bone style={styles.image} />
      <View style={styles.body}>
        <Bone style={styles.line1} />
        <Bone style={styles.line2} />
        <Bone style={styles.line3} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  image: { width: '100%', aspectRatio: 4 / 3, borderRadius: 0 },
  body: { padding: 14, gap: 8 },
  line1: { height: 18, width: '75%' },
  line2: { height: 14, width: '50%' },
  line3: { height: 14, width: '60%' },
});
