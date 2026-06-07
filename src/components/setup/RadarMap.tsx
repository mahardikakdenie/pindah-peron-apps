import React from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
} from 'react-native-reanimated';
import { 
  Gesture, 
  GestureDetector, 
  GestureHandlerRootView 
} from 'react-native-gesture-handler';
import { MAP_POINTS, MAP_CONNECTIONS, CENTER_X, CENTER_Y } from '../../utils/mapCoordinates';
import { getLineColor } from '../../utils/stations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CANVAS_SIZE = 2000;

interface RadarMapProps {
  onStationSelect: (id: string) => void;
  selectedStationId?: string | null;
}

export const RadarMap = ({ onStationSelect, selectedStationId }: RadarMapProps) => {
  const scale = useSharedValue(0.7);
  const savedScale = useSharedValue(0.7);
  
  // Initial center on the main network (Manggarai area)
  const initialX = -CENTER_X * 0.7 + SCREEN_WIDTH / 2;
  const initialY = -CENTER_Y * 0.7 + SCREEN_HEIGHT / 2;

  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const savedTranslateX = useSharedValue(initialX);
  const savedTranslateY = useSharedValue(initialY);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(0.4, Math.min(2.5, savedScale.value * e.scale));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const composed = Gesture.Simultaneous(panGesture, pinchGesture);

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.canvas, animatedStyle]}>
          {/* Render Connections (Edges) with Official Colors and Line Weights */}
          {MAP_CONNECTIONS.map(([startId, endId], index) => {
            const start = MAP_POINTS.find(p => p.id === startId);
            const end = MAP_POINTS.find(p => p.id === endId);
            if (!start || !end) return null;

            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            return (
              <View 
                key={`edge-${index}`}
                style={[
                  styles.edge,
                  {
                    width: distance + 10, // Slight overlap for smooth joints
                    left: start.x,
                    top: start.y,
                    transform: [
                      { rotate: `${angle}rad` },
                      { translateY: -5 }, // Center line weight
                    ],
                    backgroundColor: getLineColor(start.line),
                  }
                ]}
              />
            );
          })}

          {/* Render Stations (Nodes) with Schematic Symbols */}
          {MAP_POINTS.map((point) => (
            <View 
              key={point.id} 
              style={[
                styles.nodeWrapper, 
                { left: point.x - 50, top: point.y - 15 }
              ]}
            >
              <Pressable 
                onPress={() => onStationSelect(point.id)}
                style={({ pressed }) => [
                  point.isTransit ? styles.transitNode : styles.regularNode,
                  { 
                    backgroundColor: selectedStationId === point.id ? '#3b82f6' : '#FFF',
                    borderColor: selectedStationId === point.id ? '#3b82f6' : (point.isTransit ? '#334155' : getLineColor(point.line)),
                    transform: [{ scale: pressed ? 0.9 : 1 }]
                  }
                ]}
              >
                {selectedStationId === point.id && <View style={styles.selectedInner} />}
              </Pressable>
              <Text style={[
                styles.nodeName,
                selectedStationId === point.id && styles.selectedText
              ]}>
                {point.name}
              </Text>
              <Text style={styles.nodeIdBadge}>{point.id}</Text>
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
      
      {/* Legend / Overlay */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>TAP STASIUN DI PETA</Text>
        </View>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9', // Light, high-contrast background
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
  },
  edge: {
    position: 'absolute',
    height: 10, // Thicker, cleaner lines
    borderRadius: 5,
  },
  nodeWrapper: {
    position: 'absolute',
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transitNode: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 4,
    borderColor: '#334155',
    backgroundColor: '#FFF',
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  regularNode: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    backgroundColor: '#FFF',
    zIndex: 5,
  },
  selectedInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
  },
  nodeName: {
    marginTop: 4,
    fontSize: 10,
    color: '#1E293B',
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: '#FFF',
    textShadowRadius: 2,
  },
  selectedText: {
    color: '#3b82f6',
  },
  nodeIdBadge: {
    fontSize: 7,
    color: '#94A3B8',
    fontWeight: '700',
    marginTop: -2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
  },
  instructionBox: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'absolute',
    bottom: 20,
  },
  instructionText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 1,
  },
});
