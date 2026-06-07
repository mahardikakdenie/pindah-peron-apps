import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface TimeHUDProps {
  minuteDiff: number;
  delayMinutes: number;
  etaTransit: string;
  etdConnection: string;
  trainId: string;
  destination: string;
}

export const TimeHUD = ({ 
  minuteDiff, 
  delayMinutes, 
  etaTransit, 
  etdConnection, 
  trainId, 
  destination 
}: TimeHUDProps) => {
  return (
    <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.mainCard}>
      <View style={styles.glitchContainer}>
        <Text style={styles.timeDiff}>{minuteDiff}</Text>
        <View style={styles.unitContainer}>
          <Text style={styles.unitText}>MENIT</Text>
          <Text style={styles.subTime}>REMAINING</Text>
        </View>
        {delayMinutes > 0 && (
          <View style={styles.delayBadge}>
            <Text style={styles.delayBadgeText}>+{delayMinutes} MNT DELAY</Text>
          </View>
        )}
      </View>

      <View style={styles.scanLine} />

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>ETA TRANSIT</Text>
          <Text style={styles.val}>{etaTransit}</Text>
        </View>
        <View style={styles.col}>
          <Text style={[styles.label, { textAlign: 'right' }]}>ETD SAMBUNGAN</Text>
          <Text style={[styles.val, { textAlign: 'right' }]}>{etdConnection}</Text>
        </View>
      </View>

      <View style={styles.trainInfoBox}>
        <View style={styles.missionTag}>
          <Text style={styles.missionText}>MISI SAMBUNGAN</Text>
        </View>
        <Text style={styles.trainValue}>KA {trainId} ▶ {destination}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  mainCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10, overflow: 'hidden' },
  glitchContainer: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 15 },
  timeDiff: { fontSize: 84, fontWeight: '900', color: '#111', lineHeight: 84 },
  unitContainer: { marginLeft: 10, marginBottom: 12 },
  unitText: { fontSize: 24, fontWeight: '900', color: '#111', lineHeight: 24 },
  subTime: { fontSize: 10, color: '#666', fontWeight: '700', letterSpacing: 2 },
  delayBadge: { backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginLeft: 10, marginBottom: 10 },
  delayBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  scanLine: { height: 2, backgroundColor: '#F3F4F6', marginBottom: 20, width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  col: { flex: 1 },
  label: { fontSize: 10, color: '#999', fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  val: { fontSize: 20, fontWeight: '900', color: '#111', fontFamily: 'monospace' },
  trainInfoBox: { backgroundColor: '#F3F4F6', padding: 15, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#111' },
  missionTag: { backgroundColor: '#111', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginBottom: 6 },
  missionText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  trainValue: { fontSize: 14, fontWeight: '900', color: '#111' },
});
