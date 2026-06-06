import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { TransitResult, ScheduleItem, WarModeResult } from '../types/train';

interface TransitState {
  startStation: string | null;
  endStation: string | null;
  activeTrain: ScheduleItem | null;
  activeTrainSchedule: ScheduleItem[];
  transitResult: TransitResult | null;
  warModeResult: WarModeResult | null;
  isWarMode: boolean;
  transitSchedule: ScheduleItem[];

  setStartStation: (id: string) => void;
  setEndStation: (id: string) => void;
  setActiveTrain: (train: ScheduleItem) => void;
  setActiveTrainSchedule: (schedule: ScheduleItem[]) => void;
  setTransitResult: (result: TransitResult | null) => void;
  setWarModeResult: (result: WarModeResult | null) => void;
  setTransitSchedule: (schedule: ScheduleItem[]) => void;
  resetSetup: () => void;
  emergencyStop: () => void;
}

const TransitContext = createContext<TransitState | undefined>(undefined);

export const TransitProvider = ({ children }: { children: ReactNode }) => {
  const [startStation, setStartStation] = useState<string | null>(null);
  const [endStation, setEndStation] = useState<string | null>(null);
  const [activeTrain, setActiveTrain] = useState<ScheduleItem | null>(null);
  const [activeTrainSchedule, setActiveTrainSchedule] = useState<ScheduleItem[]>([]);

  const [transitResult, setTransitResult] = useState<TransitResult | null>(null);
  const [warModeResult, setWarModeResult] = useState<WarModeResult | null>(null);
  const [transitSchedule, setTransitSchedule] = useState<ScheduleItem[]>([]);

  const isWarMode = warModeResult?.ui_trigger.mode === 'RUN_MODE' || transitResult?.mode === 'RUN_MODE' || transitResult?.mode === 'WAR_MODE';

  const resetSetup = useCallback(() => {
    setStartStation(null);
    setEndStation(null);
    setActiveTrain(null);
    setActiveTrainSchedule([]);
    setTransitResult(null);
    setWarModeResult(null);
    setTransitSchedule([]);
  }, []);

  const emergencyStop = useCallback(() => {
    setTransitResult(null);
    setWarModeResult(null);
  }, []);

  return (
    <TransitContext.Provider
      value={{
        startStation,
        endStation,
        activeTrain,
        activeTrainSchedule,
        transitResult,
        warModeResult,
        isWarMode,
        transitSchedule,
        setStartStation,
        setEndStation,
        setActiveTrain,
        setActiveTrainSchedule,
        setTransitResult,
        setWarModeResult,
        setTransitSchedule,
        resetSetup,
        emergencyStop,
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
