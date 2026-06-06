import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { setupStyles as styles } from './styles';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface StationCardProps {
  item: {
    id: string;
    name: string;
    line: string;
  };
  index: number;
  onPress: () => void;
}

export const StationCard = ({ item, index, onPress }: StationCardProps) => {
  let color = '#64748b';
  if (item.line === 'Bogor') color = '#ef4444';
  if (item.line === 'Cikarang') color = '#3b82f6';
  if (item.line === 'Rangkasbitung') color = '#10b981';
  if (item.line === 'Tangerang') color = '#8b5cf6';
  if (item.line === 'TanjungPriok') color = '#ec4899';

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(index * 30).springify()}
      layout={Layout.springify()}
      style={styles.stationCard}
      onPress={onPress}
    >
      <View style={[styles.lineIndicator, { backgroundColor: color }]} />
      <View style={styles.stationBody}>
        <Text style={styles.stationName}>{item.name}</Text>
        <Text style={styles.stationMeta}>{item.id} • {item.line} Line</Text>
      </View>
      <View style={styles.actionCircle}>
        <Text style={styles.actionArrow}>→</Text>
      </View>
    </AnimatedPressable>
  );
};
