import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing
} from 'react-native-reanimated';

interface HeaderStatusProps {
  headerText: string;
  isOffline: boolean;
  message: string;
  progress: number; // 0 to 1
  mode: string;
}

export const HeaderStatus = ({ headerText, isOffline, message, progress, mode }: HeaderStatusProps) => {
  const scanPos = useSharedValue(-100);

  useEffect(() => {
    // Speed up scanline in critical modes
    const duration = mode === 'RUN_MODE' || mode === 'WAR_MODE' ? 1000 : 3000;
    scanPos.value = withRepeat(
      withTiming(500, { duration, easing: Easing.linear }),
      -1,
      false
    );
  }, [mode, scanPos]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanPos.value }],
    opacity: mode === 'CHILL_MODE' ? 0.1 : 0.3,
  }));

  return (
    <View style={styles.header}>
      {/* 🚨 Dynamic Scanline HUD Effect */}
      <Animated.View style={[styles.scanLineOverlay, scanLineStyle]} pointerEvents="none" />
      
      <View style={styles.row}>
        <Animated.Text entering={FadeInDown.springify()} style={styles.headerText}>
          {headerText}
        </Animated.Text>
        {isOffline && (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineText}>OFFLINE</Text>
          </View>
        )}
      </View>
      <Animated.Text entering={FadeInDown.delay(200)} style={styles.bodyText}>
        {message}
      </Animated.Text>

      {/* 📊 Mission Progress HUD */}
      <View style={styles.progressTrack}>
        <Animated.View 
          style={[
            styles.progressFill, 
            { width: `${progress * 100}%` },
            mode === 'RUN_MODE' && { backgroundColor: '#EF4444' }
          ]} 
        />
        <Text style={styles.progressPct}>{Math.round(progress * 100)}% COMPLETED</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: { marginTop: 10, marginBottom: 15 },
  row: { flexDirection: 'row', alignItems: 'center' },
  headerText: { fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  bodyText: { fontSize: 13, color: '#FFF', opacity: 0.7, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  offlineBadge: { backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginLeft: 10 },
  offlineText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
  progressTrack: { height: 20, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, marginTop: 15, justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  progressFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: '#3b82f6' },
  progressPct: { alignSelf: 'center', fontSize: 8, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  scanLineOverlay: { position: 'absolute', left: -50, right: -50, height: 2, backgroundColor: 'rgba(255,255,255,0.5)', zIndex: 99 },
});
