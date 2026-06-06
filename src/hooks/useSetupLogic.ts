import { useCallback, useMemo, useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { fetchStationSchedule } from '../services/kciApi';
import { ScheduleItem } from '../types/train';
import { STATIONS, STATION_LINE_MAP } from '../utils/stations';
import { getCurrentTimeParams } from '../utils/timeHelper';
import { getTransitStation, isCorrectDirection } from '../utils/transitLogic';

export const useSetupLogic = () => {
  const {
    setStartStation,
    setEndStation,
    setActiveTrain,
    startStation,
    endStation,
  } = useTransit();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [trains, setTrains] = useState<ScheduleItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedLine, setSelectedLine] = useState<string | null>(null);

  // 1. Computed Values (Must be above hooks that use them)
  const transitStation = useMemo(() => 
    startStation && endStation ? getTransitStation(startStation, endStation) : null
  , [startStation, endStation]);

  const startLine = startStation ? STATION_LINE_MAP[startStation] : null;
  const endLine = endStation ? STATION_LINE_MAP[endStation] : null;

  // 2. Logic Functions
  const handleFetchTrains = useCallback(async () => {
    if (!startStation) return;
    
    setLoading(true);
    try {
      const { timeFrom, timeTo } = getCurrentTimeParams();
      const data = await fetchStationSchedule(
        startStation,
        timeFrom,
        timeTo,
      );

      // Filter: Hanya tampilkan kereta yang searah dengan tujuan (Transit atau End)
      const targetForFirstLeg = transitStation || endStation;
      const filtered = data.filter((train: ScheduleItem) => 
        isCorrectDirection(train.dest || train.route_name || '', targetForFirstLeg!)
      );

      setTrains(filtered);
      setStep(3);
    } catch (e) {
      console.log('Gagal ambil jadwal: ', e);
    } finally {
      setLoading(false);
    }
  }, [startStation, endStation, transitStation]);

  const handleStationSelect = useCallback((stationId: string) => {
    if (step === 1) {
      setStartStation(stationId);
      setStep(2);
      setSearch('');
      setSelectedLine(null);
    } else {
      setEndStation(stationId);
    }
  }, [step, setStartStation, setEndStation]);

  const goBack = useCallback(() => {
    if (step > 1) {
      setStep(step - 1);
      setSearch('');
      setSelectedLine(null);
    }
  }, [step]);

  // 3. Effects / Computed Filters
  const filteredStations = useMemo(() => {
    let list = step === 1 ? STATIONS : STATIONS.filter((s) => s.id !== startStation);
    
    if (selectedLine) {
      list = list.filter(s => s.line === selectedLine);
    }

    if (!search.trim()) return list;
    return list.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, step, startStation, selectedLine]);

  // Trigger fetch when destination is selected in step 2
  useMemo(() => {
    if (step === 2 && endStation) {
      handleFetchTrains();
    }
  }, [step, endStation, handleFetchTrains]);

  return {
    step,
    setStep,
    loading,
    trains,
    search,
    setSearch,
    selectedLine,
    setSelectedLine,
    filteredStations,
    handleStationSelect,
    transitStation,
    startLine,
    endLine,
    startStation,
    endStation,
    setActiveTrain,
    goBack,
  };
};
