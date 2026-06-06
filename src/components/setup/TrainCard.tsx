import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, { 
  FadeInDown, 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withSequence, 
  withRepeat, 
  withSpring 
} from 'react-native-reanimated';
import { setupStyles as styles } from './styles';
import { ScheduleItem } from '../../types/train';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TrainCardProps {
  item: ScheduleItem;
  index: number;
  onPress: () => void;
}

export const TrainCard = ({ item, index, onPress }: TrainCardProps) => {
  const pulse = useSharedValue(1);
  const lineColor = item.color || '#334155';

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    shadowOpacity: withSpring(pulse.value - 0.9),
  }));

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(index * 50).springify()}
      style={[styles.trainCard, animatedStyle, { shadowColor: lineColor }]}
      onPress={onPress}
    >
      <View style={styles.trainHeader}>
        <View style={[styles.trainTag, { backgroundColor: lineColor }]}>
          <Text style={styles.trainTagText}>{item.train_id}</Text>
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeLabel}>DEPARTURE</Text>
          <Text style={styles.timeValue}>{item.time_est.slice(0, 5)}</Text>
        </View>
      </View>

      <View style={styles.destBox}>
        <Text style={styles.destTitle}>{item.dest.toUpperCase()}</Text>
        <Text style={styles.routeSubtitle} numberOfLines={1}>{item.route_name || item.route}</Text>
      </View>

      <View style={styles.trainFooter}>
        <View style={styles.footerInfo}>
          <View style={[styles.dot, { backgroundColor: lineColor }]} />
          <Text style={styles.footerText}>Line {item.ka_name?.split(' ').pop() || 'KRL'}</Text>
        </View>
        <View style={styles.selectBtn}>
          <Text style={styles.selectBtnText}>TRACK</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
};
