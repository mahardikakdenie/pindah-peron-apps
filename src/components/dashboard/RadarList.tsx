import React, { useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, Pressable } from 'react-native';
import Animated, { 
  FadeInDown, 
  FadeInRight, 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withSequence, 
  withTiming 
} from 'react-native-reanimated';

const AnimatedStation = ({
	item,
	index,
	isTransit,
	isPassed,
	isCurrent,
}: {
	item: any;
	index: number;
	isTransit: boolean;
	isPassed: boolean;
	isCurrent: boolean;
}) => {
	const pulse = useSharedValue(1);

	useEffect(() => {
		if (isTransit || isCurrent) {
			pulse.value = withRepeat(
				withSequence(
					withTiming(1.4, { duration: 1000 }),
					withTiming(1, { duration: 1000 }),
				),
				-1,
				true,
			);
		} else {
			pulse.value = 1;
		}
	}, [isTransit, isCurrent, pulse]);

	const animatedDotStyle = useAnimatedStyle(() => ({
		transform: [{ scale: pulse.value }],
		backgroundColor: isCurrent 
			? '#3b82f6' 
			: isTransit 
				? '#F59E0B' 
				: isPassed 
					? '#94A3B8' 
					: '#D1D5DB',
		shadowOpacity: (isTransit || isCurrent) ? withTiming(0.5) : 0,
		shadowRadius: (isTransit || isCurrent) ? withTiming(10) : 0,
		shadowColor: isCurrent ? '#3b82f6' : '#F59E0B',
	}));

	return (
		<Animated.View
			entering={FadeInRight.delay(index * 50)}
			style={[styles.scheduleRow, isPassed && !isCurrent && { opacity: 0.6 }]}>
			<View style={styles.dotContainer}>
				{index !== 0 && (
					<View style={[
						styles.lineConnector, 
						isPassed && { backgroundColor: '#3b82f6' }
					]} />
				)}
				<Animated.View style={[styles.scheduleDot, animatedDotStyle]} />
			</View>
			<View style={styles.stationContent}>
        <View style={styles.stationMain}>
          <Text
            style={[
              styles.scheduleStation, 
              (isTransit || isCurrent) && styles.boldText,
              isCurrent && { color: '#3b82f6' }
            ]}>
            {item.station_name || item.station_id}
          </Text>
          {isCurrent && <Text style={styles.currentLabel}>LOKASI SEKARANG</Text>}
          {isTransit && <Text style={styles.transitLabel}>TITIK TRANSIT</Text>}
        </View>
        
        {/* 🚨 POINT 2: Platform Awareness */}
        {item.platform && (
          <View style={styles.platformBadge}>
            <Text style={styles.platformText}>TRK {item.platform}</Text>
          </View>
        )}
      </View>
			<Text style={[
				styles.scheduleTime,
				isPassed && !isCurrent && { textDecorationLine: 'line-through' }
			]}>
				{item.time_est.slice(0, 5)}
			</Text>
		</Animated.View>
	);
};

interface RadarListProps {
  flatListRef: React.RefObject<FlatList | null>;
  scheduleWithStatus: any[];
  transitStationId: string;
  trainId: string;
  onAddDelay: () => void;
}

export const RadarList = ({ flatListRef, scheduleWithStatus, transitStationId, trainId, onAddDelay }: RadarListProps) => {
  return (
    <Animated.View entering={FadeInDown.delay(500)} style={styles.scheduleCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.scheduleTitle}>
          RADAR PERJALANAN KA {trainId}
        </Text>
        <Pressable onPress={onAddDelay} style={styles.delayBtn}>
          <Text style={styles.delayText}>+5 MNT DELAY</Text>
        </Pressable>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>
      <FlatList
        ref={flatListRef as any}
        data={scheduleWithStatus}
        keyExtractor={(item, index) => `${item.station_id}-${index}`}
        onScrollToIndexFailed={(info) => {
          flatListRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: true,
          });
        }}
        renderItem={({ item, index }) => (
          <AnimatedStation
            item={item}
            index={index}
            isTransit={item.station_id === transitStationId}
            isPassed={item.isPassed}
            isCurrent={item.isCurrent}
          />
        )}
        style={styles.scheduleList}
        showsVerticalScrollIndicator={false}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
	scheduleCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 15, marginVertical: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
	scheduleTitle: { fontSize: 11, fontWeight: '900', color: '#666', letterSpacing: 1 },
	liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
	liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444', marginRight: 5 },
	liveText: { fontSize: 9, fontWeight: '900', color: '#EF4444' },
	scheduleList: { flex: 1 },
	scheduleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
	dotContainer: { width: 20, alignItems: 'center', marginRight: 15 },
	lineConnector: { position: 'absolute', top: -15, width: 2, height: 20, backgroundColor: '#E5E7EB' },
	scheduleDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#D1D5DB' },
	stationContent: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 10 },
  stationMain: { flex: 1 },
  scheduleStation: { fontSize: 14, color: '#4B5563', fontWeight: '600' },
	boldText: { fontWeight: '900', color: '#111' },
	currentLabel: { fontSize: 8, fontWeight: '900', color: '#3b82f6', letterSpacing: 0.5 },
  transitLabel: { fontSize: 8, fontWeight: '900', color: '#F59E0B', letterSpacing: 0.5 },
  platformBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#E2E8F0' },
  platformText: { fontSize: 8, fontWeight: '900', color: '#475569' },
  scheduleTime: { fontSize: 12, color: '#6B7280', fontFamily: 'monospace', fontWeight: '700' },
  delayBtn: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  delayText: { fontSize: 9, fontWeight: '800', color: '#475569' }
});
