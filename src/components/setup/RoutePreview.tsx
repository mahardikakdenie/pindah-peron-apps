import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { setupStyles as styles } from './styles';

interface RoutePreviewProps {
  startLine: string | null;
  endLine: string | null;
  transitStation: string | null;
  endStation: string | null;
}

export const RoutePreview = ({ startLine, endLine, transitStation, endStation }: RoutePreviewProps) => (
  <Animated.View entering={FadeInDown.springify()} style={styles.routePreview}>
    <View style={styles.radarHeader}>
      <Text style={styles.routeTitle}>INSTRUKSI NAVIGASI</Text>
      <View style={styles.radarDot} />
    </View>
    
    <View style={styles.instructionStep}>
      <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
      <View style={styles.stepContent}>
        <Text style={styles.stepInstr}>
          Naik Lin <Text style={styles.boldText}>{startLine}</Text> 
          {transitStation ? ` tujuan ${transitStation}` : ` ke tujuan akhir`}
        </Text>
        <Text style={styles.stepSubInstr}>Turun di: {transitStation || endStation}</Text>
      </View>
    </View>

    {transitStation && (
      <View style={styles.instructionStep}>
        <View style={[styles.stepBadge, { backgroundColor: '#3b82f6' }]}><Text style={styles.stepBadgeText}>2</Text></View>
        <View style={styles.stepContent}>
          <Text style={styles.stepInstr}>
            TRANSIT. Pindah ke Lin <Text style={styles.boldText}>{endLine}</Text>
          </Text>
          <Text style={styles.stepSubInstr}>Tujuan Akhir: {endStation}</Text>
        </View>
      </View>
    )}

    <View style={styles.transitHintBox}>
      <Text style={styles.transitHint}>
        STATUS: {transitStation ? 'TRANSIT REQUIRED' : 'DIRECT ROUTE'}
      </Text>
      <Text style={styles.transitSubHint}>
        Sistem sedang memantau unit aktif di radar...
      </Text>
    </View>
  </Animated.View>
);
