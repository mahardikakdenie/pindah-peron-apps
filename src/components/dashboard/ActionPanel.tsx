import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface ActionPanelProps {
  mode: string;
  canTakeAction: boolean;
  boardNextTrain: () => void;
  markAsLate: () => void;
  resetSetup: () => void;
  addDelay: (mins: number) => void;
}

export const ActionPanel = ({ 
  mode, 
  canTakeAction, 
  boardNextTrain, 
  markAsLate, 
  resetSetup,
  addDelay 
}: ActionPanelProps) => {
  return (
    <View style={styles.actions}>
      {(mode === 'RUN_MODE' || mode === 'WAR_MODE' || mode === 'HURRY_MODE') && (
        <View style={styles.missionActions}>
          <Animated.View entering={FadeInDown.springify()} style={{ flex: 1 }}>
            <Pressable
              disabled={!canTakeAction}
              style={[styles.emergencyBtn, !canTakeAction && styles.disabledBtn]}
              onPress={boardNextTrain}>
              <Text style={styles.emergencyText}>
                {canTakeAction ? 'SAYA SUDAH DI DALAM' : 'MENUNGGU UNIT...'}
              </Text>
            </Pressable>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Pressable
              disabled={!canTakeAction}
              style={[styles.lateBtn, !canTakeAction && styles.disabledLateBtn]}
              onPress={markAsLate}>
              <Text style={[styles.lateText, !canTakeAction && styles.disabledLateText]}>TELAT KAPTEN</Text>
            </Pressable>
          </Animated.View>
        </View>
      )}
      
      <View style={styles.secondaryActions}>
        <Pressable style={styles.cancelBtn} onPress={resetSetup}>
          <Text style={styles.cancelText}>BATALKAN OPERASI</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
	actions: { gap: 10 },
	missionActions: { flexDirection: 'row', gap: 10 },
  secondaryActions: { marginTop: 5 },
	emergencyBtn: { backgroundColor: '#000', padding: 18, borderRadius: 12, alignItems: 'center', borderBottomWidth: 4, borderBottomColor: '#333' },
	disabledBtn: { backgroundColor: '#94A3B8', borderBottomColor: '#64748B' },
	emergencyText: { color: '#FFF', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
	lateBtn: { backgroundColor: '#FFF', padding: 18, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#000' },
	disabledLateBtn: { borderColor: '#94A3B8' },
	lateText: { color: '#000', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
	disabledLateText: { color: '#94A3B8' },
	cancelBtn: { backgroundColor: 'transparent', padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
	cancelText: { color: '#FFF', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
});
