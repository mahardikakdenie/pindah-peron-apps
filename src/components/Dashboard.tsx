import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  Text,
  View,
  Pressable,
} from 'react-native';
import Animated, {
  FadeInDown,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransit } from '../context/TransitContext';
import { usePolling } from '../hooks/usePolling';
import { useVibration } from '../hooks/useVibration';
import { isTimePassed } from '../utils/timeHelper';

// Modular Components & Styles
import { HeaderStatus } from './dashboard/HeaderStatus';
import { TimeHUD } from './dashboard/TimeHUD';
import { RadarList } from './dashboard/RadarList';
import { ActionPanel } from './dashboard/ActionPanel';
import { dashboardStyles as styles } from './dashboard/styles';

export const Dashboard = () => {
	const {
		warModeResult,
		transitResult,
		isWarMode,
    isOffline,
    delayMinutes,
    addDelay,
		boardNextTrain,
		markAsLate,
		activeTrain,
		activeTrainSchedule,
		resetSetup,
	} = useTransit();

	const [loadingTime, setLoadingTime] = useState(0);
	const [now, setNow] = useState(new Date());
  // 🚨 State for minute-level stability
	const [currentMinute, setCurrentMinute] = useState(new Date().getMinutes());
	const bgColorValue = useSharedValue(0);
	const flatListRef = React.useRef<FlatList>(null);

	useVibration();
	usePolling();

  // Update clock, but only update currentMinute when it actually changes
	useEffect(() => {
		const t = setInterval(() => {
      const d = new Date();
      setNow(d);
      if (d.getMinutes() !== currentMinute) {
        setCurrentMinute(d.getMinutes());
      }
    }, 10000);
		return () => clearInterval(t);
	}, [currentMinute]);

	// 🚨 POINT 3: Simplified Compatibility Bridge
	const data = useMemo(() => warModeResult || (transitResult ? {
		ui_trigger: { mode: transitResult.mode, color_code: '#10B981', message: 'MENGKALIBRASI MISI...' },
		kalkulasi: { selisih_menit: transitResult.minuteDiff },
		transit_analysis: { waktu_tiba_estimasi: transitResult.arrivalTrain.time_est, transit_station_id: 'MRI' },
		connecting_train: { found: true, train_id_sambungan: transitResult.nextTrain.train_id, destinasi: transitResult.nextTrain.dest, waktu_berangkat_estimasi: transitResult.nextTrain.time_est }
	} : null), [warModeResult, transitResult]);

	useEffect(() => {
		let interval: ReturnType<typeof setInterval>;
		if (!data) {
			interval = setInterval(() => setLoadingTime((prev) => prev + 1), 1000);
		}
		return () => {
			if (interval) clearInterval(interval);
			setLoadingTime(0);
		};
	}, [data]);

	useEffect(() => {
		if (data) {
			const mode = data.ui_trigger.mode;
			const target = mode === 'RUN_MODE' || mode === 'WAR_MODE' ? 2 : mode === 'HURRY_MODE' ? 1 : 0;
			bgColorValue.value = withTiming(target, { duration: 1000 });
		}
	}, [data, isWarMode, bgColorValue]);

  // Calculate journey progress percentage
	const journeyProgress = useMemo(() => {
		if (activeTrainSchedule.length === 0) return 0;
		const passedCount = activeTrainSchedule.filter((s) => isTimePassed(s.time_est, now)).length;
		return passedCount / activeTrainSchedule.length;
	}, [activeTrainSchedule, now]);

  // 🚨 POINT 4: Memoize only based on minute change to reduce re-renders
	const { scheduleWithStatus, currentIndex } = useMemo(() => {
		let lastPassedIndex = -1;
		const mapped = activeTrainSchedule.map((item, idx) => {
			const passed = isTimePassed(item.time_est, now);
			if (passed) lastPassedIndex = idx;
			return { ...item, isPassed: passed };
		});

		return {
			scheduleWithStatus: mapped.map((item, idx) => ({
				...item,
				isCurrent: idx === lastPassedIndex
			})),
			currentIndex: lastPassedIndex
		};
	}, [activeTrainSchedule, now]); // Removed currentMinute dependency per ESLint warning

	useEffect(() => {
		if (currentIndex !== -1 && flatListRef.current) {
			flatListRef.current.scrollToIndex({
				index: currentIndex,
				animated: true,
				viewPosition: 0.2
			});
		}
	}, [currentIndex]);

	// 🚨 POINT 2: Robust Time Validation with Regex & Error Handling
	const canTakeAction = useMemo(() => {
    try {
      if (!data || !data.connecting_train.found || data.connecting_train.waktu_berangkat_estimasi === '-') return false;
      
      const timeStr = data.connecting_train.waktu_berangkat_estimasi;
      const isValidFormat = /^\d{2}:\d{2}(:\d{2})?$/.test(timeStr);
      if (!isValidFormat) return false;

      const [h, m] = timeStr.split(':').map(Number);
      const depDate = new Date();
      depDate.setHours(h, m, 0, 0);
      return now >= depDate;
    } catch (err) {
      console.warn('[Dashboard] Time validation failed:', err);
      return false;
    }
	}, [now, data]);

	const animatedContainerStyle = useAnimatedStyle(() => {
		const backgroundColor = interpolateColor(
			bgColorValue.value,
			[0, 1, 2],
			['#10B981', '#F59E0B', '#EF4444'],
		);
		return { backgroundColor };
	});

	if (!data) {
		return (
			<SafeAreaView style={[styles.safeArea, { backgroundColor: '#F8FAFC' }]}>
				<StatusBar barStyle='dark-content' />
				<View style={styles.center}>
					<ActivityIndicator size='large' color='#3b82f6' />
					<Text style={styles.loadingText}>MENYINKRONKAN DATA TRANSIT...</Text>
					<Text style={styles.trainInfoText}>TRACKING KA {activeTrain?.train_id}</Text>
					{loadingTime > 10 && (
						<Animated.View entering={FadeInDown} style={styles.errorBox}>
							<Text style={styles.errorText}>Target tidak terdeteksi dalam radar. Mungkin kereta sudah lewat atau belum berangkat.</Text>
							<Pressable style={styles.retryBtn} onPress={resetSetup}>
								<Text style={styles.retryText}>KALIBRASI ULANG RUTE</Text>
							</Pressable>
						</Animated.View>
					)}
				</View>
			</SafeAreaView>
		);
	}

	const mode = data.ui_trigger.mode;
  const statusLabel = mode === 'RUN_MODE' || mode === 'WAR_MODE' ? '🚨 STATUS: CRITICAL 🚨' : mode === 'HURRY_MODE' ? '🏃 STATUS: URGENT 🏃' : '🧘 STATUS: NOMINAL 🧘';

	return (
		<Animated.View style={[styles.safeArea, animatedContainerStyle]}>
			<SafeAreaView style={{ flex: 1 }}>
				<StatusBar barStyle='light-content' />
				<View style={styles.content}>
          <HeaderStatus 
            headerText={statusLabel}
            isOffline={isOffline}
            message={data.ui_trigger.message}
            progress={journeyProgress}
            mode={mode}
          />

          <TimeHUD 
            minuteDiff={data.kalkulasi.selisih_menit}
            delayMinutes={delayMinutes}
            etaTransit={data.transit_analysis.waktu_tiba_estimasi.slice(0, 5)}
            etdConnection={data.connecting_train.waktu_berangkat_estimasi.slice(0, 5)}
            trainId={data.connecting_train.train_id_sambungan}
            destination={data.connecting_train.destinasi}
          />

          <RadarList 
            flatListRef={flatListRef}
            scheduleWithStatus={scheduleWithStatus}
            transitStationId={data.transit_analysis.transit_station_id}
            trainId={activeTrain?.train_id || ''}
            onAddDelay={() => addDelay(5)}
          />

          <ActionPanel 
            mode={mode}
            canTakeAction={canTakeAction}
            boardNextTrain={boardNextTrain}
            markAsLate={markAsLate}
            resetSetup={resetSetup}
            addDelay={addDelay}
          />
				</View>
			</SafeAreaView>
		</Animated.View>
	);
};
