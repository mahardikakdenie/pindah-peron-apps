import { useEffect, useState, useRef } from 'react';
import { Vibration } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useTransit } from '../context/TransitContext';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Configure how notifications are handled when the app is foregrounded
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Custom Hook for Tactile & Alert Feedback
 * Handles: Vibrations and Local Push Notifications
 */
export const useVibration = () => {
  const { warModeResult, transitResult } = useTransit();
  const [now, setNow] = useState(new Date());
  const prevModeRef = useRef<string | null>(null);

  // Real-time internal clock (Check every 5 seconds)
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const result = warModeResult || transitResult;
    if (!result) {
      Vibration.cancel();
      return;
    }

    let mode: string;
    let arrivalTimeStr: string;
    let message: string;

    // Handle data format compatibility
    if ('ui_trigger' in result) {
      mode = result.ui_trigger.mode;
      arrivalTimeStr = result.transit_analysis.waktu_tiba_estimasi;
      message = result.ui_trigger.message;
    } else {
      mode = (result as any).mode;
      arrivalTimeStr = (result as any).arrivalTrain.time_est;
      message = 'Transit Required';
    }

    if (!arrivalTimeStr || arrivalTimeStr === '-') {
      Vibration.cancel();
      return;
    }

    // Parse Arrival Time at Transit
    const [arrH, arrM] = arrivalTimeStr.split(':').map(Number);
    const arrivalDate = new Date();
    arrivalDate.setHours(arrH, arrM, 0, 0);

    // VALIDATION: Only trigger if user has actually reached or passed arrival time
    const isAtTransit = now >= arrivalDate;

    if (isAtTransit) {
      // Trigger Notification on Mode Escalation
      if (mode !== prevModeRef.current) {
        const title = (mode === 'RUN_MODE' || mode === 'WAR_MODE') ? '🚨 MISI KRITIS: LARI SEKARANG!' : '🏃 STATUS: URGENT';
        
        // 🚨 Expo Go SDK 53+ restriction: Remote push is gone, but local might throw warning
        // We only trigger if not in Expo Go or at least log it
        if (!isExpoGo) {
          Notifications.scheduleNotificationAsync({
            content: { title, body: message, sound: true },
            trigger: null,
          });
        } else {
          console.log(`[Notification Fallback]: ${title} - ${message}`);
        }
        
        prevModeRef.current = mode;
      }

      // Handle Vibrations
      if (mode === 'RUN_MODE' || mode === 'WAR_MODE') {
        Vibration.vibrate([0, 300, 100, 300, 100, 800], true);
      } else if (mode === 'HURRY_MODE') {
        Vibration.vibrate([0, 150, 150, 150, 1000], true);
      } else {
        Vibration.cancel();
      }
    } else {
      Vibration.cancel();
    }

    return () => Vibration.cancel();
  }, [warModeResult, transitResult, now]);
};
