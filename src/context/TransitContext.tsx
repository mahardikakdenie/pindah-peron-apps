import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TransitResult, ScheduleItem, WarModeResult, Station } from '../types/train';
import { fetchStations } from '../services/kciApi';

const STORAGE_KEYS = {
  START_STATION: '@pindahperon_start',
  END_STATION: '@pindahperon_end',
  ACTIVE_TRAIN: '@pindahperon_train',
  MISSED_TRAINS: '@pindahperon_missed',
};

interface TransitState {
  stations: Station[];
  loadingStations: boolean;
  isOffline: boolean;
  delayMinutes: number;
  startStation: string | null;
  endStation: string | null;
  activeTrain: ScheduleItem | null;
  activeTrainSchedule: ScheduleItem[];
  transitResult: TransitResult | null;
  warModeResult: WarModeResult | null;
  isWarMode: boolean;
  transitSchedule: ScheduleItem[];
  missedTrainIds: string[];

  setStartStation: (id: string | null) => void;
  setEndStation: (id: string | null) => void;
  setActiveTrain: (train: ScheduleItem | null) => void;
  setActiveTrainSchedule: (schedule: ScheduleItem[]) => void;
  setTransitResult: (result: TransitResult | null) => void;
  setWarModeResult: (result: WarModeResult | null) => void;
  setTransitSchedule: (schedule: ScheduleItem[]) => void;
  setIsOffline: (status: boolean) => void;
  addDelay: (mins: number) => void;
  resetSetup: () => void;
  boardNextTrain: () => void;
  markAsLate: () => void;
  emergencyStop: () => void;
  initializeStations: () => Promise<void>;
}

const TransitContext = createContext<TransitState | undefined>(undefined);

export const TransitProvider = ({ children }: { children: ReactNode }) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState(0);

  const [startStation, _setStartStation] = useState<string | null>(null);
  const [endStation, _setEndStation] = useState<string | null>(null);
  const [activeTrain, _setActiveTrain] = useState<ScheduleItem | null>(null);
  const [activeTrainSchedule, setActiveTrainSchedule] = useState<ScheduleItem[]>([]);

  const [transitResult, setTransitResult] = useState<TransitResult | null>(null);
  const [warModeResult, setWarModeResult] = useState<WarModeResult | null>(null);
  const [transitSchedule, setTransitSchedule] = useState<ScheduleItem[]>([]);
  const [missedTrainIds, setMissedTrainIds] = useState<string[]>([]);

  // 1. PERSISTENCE: Persistence Logic
  const setStartStation = useCallback((val: string | null) => {
    _setStartStation(val);
    if (val) AsyncStorage.setItem(STORAGE_KEYS.START_STATION, val);
    else AsyncStorage.removeItem(STORAGE_KEYS.START_STATION);
  }, []);

  const setEndStation = useCallback((val: string | null) => {
    _setEndStation(val);
    if (val) AsyncStorage.setItem(STORAGE_KEYS.END_STATION, val);
    else AsyncStorage.removeItem(STORAGE_KEYS.END_STATION);
  }, []);

  const setActiveTrain = useCallback((val: ScheduleItem | null) => {
    _setActiveTrain(val);
    if (val) AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_TRAIN, JSON.stringify(val));
    else AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_TRAIN);
  }, []);

  // Hydrate state from AsyncStorage on mount
  useEffect(() => {
    const hydrate = async () => {
      try {
        const [s, e, t, m] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.START_STATION),
          AsyncStorage.getItem(STORAGE_KEYS.END_STATION),
          AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_TRAIN),
          AsyncStorage.getItem(STORAGE_KEYS.MISSED_TRAINS),
        ]);
        if (s) _setStartStation(s);
        if (e) _setEndStation(e);
        if (t) _setActiveTrain(JSON.parse(t));
        if (m) setMissedTrainIds(JSON.parse(m));
      } catch (err) {
        console.warn('Hydration error:', err);
      }
    };
    hydrate();
  }, []);

  // Update missed trains in storage when it changes
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.MISSED_TRAINS, JSON.stringify(missedTrainIds));
  }, [missedTrainIds]);

  const initializeStations = useCallback(async () => {
    setLoadingStations(true);
    try {
      const data = await fetchStations();
      setStations(data);
    } finally {
      setLoadingStations(false);
    }
  }, []);

  useEffect(() => {
    initializeStations();
  }, [initializeStations]);

  const isWarMode = warModeResult?.ui_trigger.mode === 'RUN_MODE' || transitResult?.mode === 'RUN_MODE' || transitResult?.mode === 'WAR_MODE';

  const resetSetup = useCallback(() => {
    setStartStation(null);
    setEndStation(null);
    setActiveTrain(null);
    setActiveTrainSchedule([]);
    setTransitResult(null);
    setWarModeResult(null);
    setTransitSchedule([]);
    setMissedTrainIds([]);
    setDelayMinutes(0);
    setIsOffline(false);
  }, [setStartStation, setEndStation, setActiveTrain]);

  const boardNextTrain = useCallback(() => {
    if (warModeResult?.connecting_train.found && transitSchedule.length > 0) {
      const nextTrainId = warModeResult.connecting_train.train_id_sambungan;
      const nextTrainFull = transitSchedule.find(t => t.train_id === nextTrainId);
      
      if (nextTrainFull) {
        setActiveTrain(nextTrainFull);
        setWarModeResult(null);
        setTransitResult(null);
        setTransitSchedule([]);
        setActiveTrainSchedule([]);
        setMissedTrainIds([]);
        setDelayMinutes(0); 
        return;
      }
    }
    setTransitResult(null);
    setWarModeResult(null);
  }, [warModeResult, transitSchedule, setActiveTrain]);

  const markAsLate = useCallback(() => {
    if (warModeResult?.connecting_train.found) {
      setMissedTrainIds(prev => [...prev, warModeResult.connecting_train.train_id_sambungan]);
      setWarModeResult(null);
    }
  }, [warModeResult]);

  const addDelay = useCallback((mins: number) => {
    setDelayMinutes(prev => prev + mins);
  }, []);

  const emergencyStop = useCallback(() => {
    setTransitResult(null);
    setWarModeResult(null);
  }, []);

  return (
    <TransitContext.Provider
      value={{
        stations,
        loadingStations,
        isOffline,
        delayMinutes,
        startStation,
        endStation,
        activeTrain,
        activeTrainSchedule,
        transitResult,
        warModeResult,
        isWarMode,
        transitSchedule,
        missedTrainIds,
        setStartStation,
        setEndStation,
        setActiveTrain,
        setActiveTrainSchedule,
        setTransitResult,
        setWarModeResult,
        setTransitSchedule,
        setIsOffline,
        addDelay,
        resetSetup,
        boardNextTrain,
        markAsLate,
        emergencyStop,
        initializeStations,
      }}
    >
      {children}
    </TransitContext.Provider>
  );
};

export const useTransit = () => {
  const ctx = useContext(TransitContext);
  if (!ctx) throw new Error('useTransit must be used within TransitProvider');
  return ctx;
};
