import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTransit } from '../context/TransitContext';
import { usePolling } from '../hooks/usePolling';
import { useVibration } from '../hooks/useVibration';

const AnimatedStation = ({
	item,
	index,
	isTransit,
}: {
	item: any;
	index: number;
	isTransit: boolean;
}) => {
	const pulse = useSharedValue(1);

	useEffect(() => {
		if (isTransit) {
			pulse.value = withRepeat(
				withSequence(
					withTiming(1.5, { duration: 1000 }),
					withTiming(1, { duration: 1000 }),
				),
				-1,
				true,
			);
		}
	}, [isTransit, pulse]);

	const animatedDotStyle = useAnimatedStyle(() => ({
		transform: [{ scale: pulse.value }],
		backgroundColor: isTransit ? '#F59E0B' : '#D1D5DB',
		shadowOpacity: isTransit ? withTiming(0.5) : 0,
		shadowRadius: isTransit ? withTiming(10) : 0,
		shadowColor: '#F59E0B',
	}));

	return (
		<Animated.View
			entering={FadeInRight.delay(index * 50)}
			style={styles.scheduleRow}>
			<View style={styles.dotContainer}>
				{index !== 0 && <View style={styles.lineConnector} />}
				<Animated.View style={[styles.scheduleDot, animatedDotStyle]} />
			</View>
			<Text
				style={[styles.scheduleStation, isTransit && styles.boldText]}>
				{item.station_name || item.station_id}
			</Text>
			<Text style={styles.scheduleTime}>{item.time_est}</Text>
		</Animated.View>
	);
};

export const Dashboard = () => {
	const {
		warModeResult,
		transitResult,
		isWarMode,
		emergencyStop,
		activeTrain,
		activeTrainSchedule,
		resetSetup,
	} = useTransit();
	const [loadingTime, setLoadingTime] = useState(0);
	const bgColorValue = useSharedValue(0);

	// Compatibility bridge for transition
	const data = useMemo(() => warModeResult || (transitResult ? {
		ui_trigger: { mode: transitResult.mode, color_code: '#10B981', message: 'LAKUKAN TRANSIT DENGAN EFEKTIF' },
		kalkulasi: { selisih_menit: transitResult.minuteDiff },
		transit_analysis: { waktu_tiba_estimasi: transitResult.arrivalTrain.time_est, transit_station_id: 'MRI' },
		connecting_train: { found: true, train_id_sambungan: transitResult.nextTrain.train_id, destinasi: transitResult.nextTrain.dest, waktu_berangkat_estimasi: transitResult.nextTrain.time_est }
	} : null), [warModeResult, transitResult]);

	useVibration();
	usePolling();

	useEffect(() => {
		let interval: ReturnType<typeof setInterval>;
		if (!data) {
			interval = setInterval(
				() => setLoadingTime((prev) => prev + 1),
				1000,
			);
		}
		return () => {
			clearInterval(interval);
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

	const animatedContainerStyle = useAnimatedStyle(() => {
		const backgroundColor = interpolateColor(
			bgColorValue.value,
			[0, 1, 2],
			['#10B981', '#F59E0B', '#EF4444'], // Emerald, Amber, KRL Red
		);
		return { backgroundColor };
	});

	if (!data) {
		return (
			<SafeAreaView
				style={[styles.safeArea, { backgroundColor: '#F8FAFC' }]}>
				<StatusBar barStyle='dark-content' />
				<View style={styles.center}>
					<ActivityIndicator
						size='large'
						color='#3b82f6'
					/>
					<Text style={styles.loadingText}>
						MENYINKRONKAN DATA TRANSIT...
					</Text>
					<Text style={styles.trainInfoText}>
						TRACKING KA {activeTrain?.train_id}
					</Text>

					{loadingTime > 10 && (
						<Animated.View
							entering={FadeInDown}
							style={styles.errorBox}>
							<Text style={styles.errorText}>
								Target tidak terdeteksi dalam radar. Mungkin
								kereta sudah lewat atau belum berangkat.
							</Text>
							<Pressable
								style={styles.retryBtn}
								onPress={resetSetup}>
								<Text style={styles.retryText}>
									KALIBRASI ULANG RUTE
								</Text>
							</Pressable>
						</Animated.View>
					)}
				</View>
			</SafeAreaView>
		);
	}

	const mode = data.ui_trigger.mode;
	const headerText = mode === 'RUN_MODE' || mode === 'WAR_MODE'
		? '🚨 STATUS: CRITICAL 🚨'
		: mode === 'HURRY_MODE'
			? '🏃 STATUS: URGENT 🏃'
			: '🧘 STATUS: NOMINAL 🧘';

	return (
		<Animated.View style={[styles.safeArea, animatedContainerStyle]}>
			<SafeAreaView style={{ flex: 1 }}>
				<StatusBar barStyle='light-content' />
				<View style={styles.content}>
					<View style={styles.header}>
						<Animated.Text
							entering={FadeInDown.springify()}
							style={styles.headerText}>
							{headerText}
						</Animated.Text>
						<Animated.Text
							entering={FadeInDown.delay(200)}
							style={styles.bodyText}>
							{data.ui_trigger.message}
						</Animated.Text>
					</View>

					<Animated.View
						entering={FadeInDown.delay(300).springify()}
						style={styles.mainCard}>
						<View style={styles.glitchContainer}>
							<Text style={styles.timeDiff}>
								{data.kalkulasi.selisih_menit}
							</Text>
							<View style={styles.unitContainer}>
								<Text style={styles.unitText}>MENIT</Text>
								<Text style={styles.subTime}>REMAINING</Text>
							</View>
						</View>

						<View style={styles.scanLine} />

						<View style={styles.row}>
							<View style={styles.col}>
								<Text style={styles.label}>ETA TRANSIT</Text>
								<Text style={styles.val}>
									{data.transit_analysis.waktu_tiba_estimasi.slice(0, 5)}
								</Text>
							</View>
							<View style={styles.col}>
								<Text
									style={[
										styles.label,
										{ textAlign: 'right' },
									]}>
									ETD SAMBUNGAN
								</Text>
								<Text
									style={[
										styles.val,
										{ textAlign: 'right' },
									]}>
									{data.connecting_train.waktu_berangkat_estimasi.slice(0, 5)}
								</Text>
							</View>
						</View>

						<View style={styles.trainInfoBox}>
							<View style={styles.missionTag}>
								<Text style={styles.missionText}>
									MISI SAMBUNGAN
								</Text>
							</View>
							<Text style={styles.trainValue}>
								KA {data.connecting_train.train_id_sambungan} ▶{' '}
								{data.connecting_train.destinasi}
							</Text>
						</View>
					</Animated.View>

					{activeTrainSchedule.length > 0 && (
						<Animated.View
							entering={FadeInDown.delay(500)}
							style={styles.scheduleCard}>
							<View style={styles.cardHeader}>
								<Text style={styles.scheduleTitle}>
									RADAR PERJALANAN KA {activeTrain?.train_id}
								</Text>
								<View style={styles.liveIndicator}>
									<View style={styles.liveDot} />
									<Text style={styles.liveText}>LIVE</Text>
								</View>
							</View>
							<FlatList
								data={activeTrainSchedule}
								keyExtractor={(item, index) =>
									`${item.station_id}-${index}`
								}
								renderItem={({ item, index }) => (
									<AnimatedStation
										item={item}
										index={index}
										isTransit={item.station_id === data.transit_analysis.transit_station_id}
									/>
								)}
								style={styles.scheduleList}
								showsVerticalScrollIndicator={false}
							/>
						</Animated.View>
					)}

					<View style={styles.actions}>
						{(mode === 'RUN_MODE' || mode === 'WAR_MODE') && (
							<Animated.View entering={FadeInDown.springify()}>
								<Pressable
									style={styles.emergencyBtn}
									onPress={emergencyStop}>
									<Text style={styles.emergencyText}>
										MISI SELESAI: SAYA SUDAH DI DALAM
									</Text>
								</Pressable>
							</Animated.View>
						)}
						<Pressable
							style={styles.cancelBtn}
							onPress={resetSetup}>
							<Text style={styles.cancelText}>
								BATALKAN OPERASI
							</Text>
						</Pressable>
					</View>
				</View>
			</SafeAreaView>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	safeArea: { flex: 1 },
	center: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 24,
	},
	loadingText: {
		marginTop: 16,
		color: '#333',
		fontSize: 16,
		fontWeight: '900',
		letterSpacing: 1,
	},
	trainInfoText: {
		marginTop: 8,
		color: '#666',
		fontSize: 12,
		letterSpacing: 2,
	},
	errorBox: {
		marginTop: 32,
		backgroundColor: '#000',
		padding: 20,
		borderRadius: 12,
		width: '100%',
		borderLeftWidth: 4,
		borderLeftColor: '#EF4444',
	},
	errorText: {
		color: '#FFF',
		textAlign: 'left',
		marginBottom: 16,
		lineHeight: 20,
		fontSize: 13,
		fontFamily: 'monospace',
	},
	retryBtn: {
		backgroundColor: '#EF4444',
		padding: 16,
		borderRadius: 8,
		alignItems: 'center',
	},
	retryText: { color: '#FFF', fontWeight: '900', fontSize: 14 },
	content: { flex: 1, padding: 20, justifyContent: 'space-between' },
	header: { marginTop: 10, marginBottom: 10 },
	headerText: {
		fontSize: 32,
		fontWeight: '900',
		color: '#FFF',
		letterSpacing: -0.5,
	},
	bodyText: {
		fontSize: 14,
		color: '#FFF',
		opacity: 0.8,
		fontWeight: '600',
		letterSpacing: 1,
		textTransform: 'uppercase',
	},
	mainCard: {
		backgroundColor: '#FFF',
		borderRadius: 16,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.3,
		shadowRadius: 20,
		elevation: 10,
		overflow: 'hidden',
	},
	glitchContainer: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		marginBottom: 15,
	},
	timeDiff: {
		fontSize: 84,
		fontWeight: '900',
		color: '#111',
		lineHeight: 84,
	},
	unitContainer: { marginLeft: 10, marginBottom: 12 },
	unitText: {
		fontSize: 24,
		fontWeight: '900',
		color: '#111',
		lineHeight: 24,
	},
	subTime: {
		fontSize: 10,
		color: '#666',
		fontWeight: '700',
		letterSpacing: 2,
	},
	scanLine: {
		height: 2,
		backgroundColor: '#F3F4F6',
		marginBottom: 20,
		width: '100%',
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 20,
	},
	col: { flex: 1 },
	label: {
		fontSize: 10,
		color: '#999',
		fontWeight: '900',
		letterSpacing: 1,
		marginBottom: 4,
	},
	val: {
		fontSize: 20,
		fontWeight: '900',
		color: '#111',
		fontFamily: 'monospace',
	},
	trainInfoBox: {
		backgroundColor: '#F3F4F6',
		padding: 15,
		borderRadius: 12,
		borderLeftWidth: 4,
		borderLeftColor: '#111',
	},
	missionTag: {
		backgroundColor: '#111',
		alignSelf: 'flex-start',
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 4,
		marginBottom: 6,
	},
	missionText: { color: '#FFF', fontSize: 9, fontWeight: '900' },
	trainValue: { fontSize: 14, fontWeight: '900', color: '#111' },
	scheduleCard: {
		flex: 1,
		backgroundColor: '#FFF',
		borderRadius: 16,
		padding: 15,
		marginVertical: 15,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 5,
	},
	cardHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 15,
	},
	scheduleTitle: {
		fontSize: 11,
		fontWeight: '900',
		color: '#666',
		letterSpacing: 1,
	},
	liveIndicator: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FEE2E2',
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 12,
	},
	liveDot: {
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: '#EF4444',
		marginRight: 5,
	},
	liveText: { fontSize: 9, fontWeight: '900', color: '#EF4444' },
	scheduleList: { flex: 1 },
	scheduleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 10,
	},
	dotContainer: { width: 20, alignItems: 'center', marginRight: 15 },
	lineConnector: {
		position: 'absolute',
		top: -15,
		width: 2,
		height: 20,
		backgroundColor: '#E5E7EB',
	},
	scheduleDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: '#D1D5DB',
	},
	scheduleStation: {
		flex: 1,
		fontSize: 14,
		color: '#4B5563',
		fontWeight: '600',
	},
	boldText: { fontWeight: '900', color: '#111' },
	scheduleTime: {
		fontSize: 12,
		color: '#6B7280',
		fontFamily: 'monospace',
		fontWeight: '700',
	},
	actions: { gap: 10 },
	emergencyBtn: {
		backgroundColor: '#000',
		padding: 18,
		borderRadius: 12,
		alignItems: 'center',
		borderBottomWidth: 4,
		borderBottomColor: '#333',
	},
	emergencyText: {
		color: '#FFF',
		fontWeight: '900',
		fontSize: 14,
		letterSpacing: 1,
	},
	cancelBtn: {
		backgroundColor: 'transparent',
		padding: 12,
		borderRadius: 12,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.4)',
	},
	cancelText: {
		color: '#FFF',
		fontWeight: '800',
		fontSize: 13,
		letterSpacing: 1,
	},
});
