import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { fetchStationSchedule } from '../services/kciApi';
import { ScheduleItem } from '../types/train';
import { isStrictCorrectDirection } from '../utils/directionalFilter';
import { STATION_LINE_MAP } from '../utils/stations';
import { getCurrentTimeParams } from '../utils/timeHelper';
import { getTransitStation } from '../utils/transitLogic';

export const useSetupLogic = () => {
  const {
    stations,
    loadingStations,
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

  // 1. Computed Values
  const transitStation = useMemo(() => 
    startStation && endStation ? getTransitStation(STATION_LINE_MAP[startStation], endStation) : null
  , [startStation, endStation]);

  const startLine = startStation ? STATION_LINE_MAP[startStation] : null;
  const endLine = endStation ? STATION_LINE_MAP[endStation] : null;

  const startStationName = useMemo(() => stations.find(s => s.sta_id === startStation)?.sta_name || startStation || '', [stations, startStation]);
  const endStationName = useMemo(() => stations.find(s => s.sta_id === endStation)?.sta_name || endStation || '', [stations, endStation]);

  // 2. Logic Functions
  const handleFetchTrains = useCallback(async (originId: string, destId: string, transitId: string | null) => {
    setLoading(true);
    try {
      const { timeFrom, timeTo } = getCurrentTimeParams();
      console.log(`[Setup] Fetching trains from ${originId} for destination ${destId}`);
      
      const data = await fetchStationSchedule(originId, timeFrom, timeTo);
      console.log(`[Setup] Received ${data.length} raw trains`);

      // Filter: Only show train which way same with target (Transit or end)
      const targetForFirstLeg = transitId || destId;
      const filtered = data.filter((train: ScheduleItem) => 
        isStrictCorrectDirection(train.dest || train.route_name || '', originId, targetForFirstLeg)
      );

      console.log(`[Setup] After strict directional filter: ${filtered.length} trains remaining`);

      if (filtered.length === 0 && data.length > 0) {
        setTrains(data);
      } else {
        setTrains(filtered);
      }
      
      setStep(3);
    } catch (e) {
      console.error('[Setup] Gagal ambil jadwal: ', e);
    } finally {
      setLoading(false);
    }
  }, []);

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
    if (step === 3) {
      setStep(2);
    } else if (step === 2) {
      setStep(1);
      // @ts-ignore
      setStartStation(null);
    }
    setSearch('');
    setSelectedLine(null);
  }, [step, setStartStation]);

  const resetToStart = useCallback(() => {
    setStep(1);
    // @ts-ignore
    setStartStation(null);
    // @ts-ignore
    setEndStation(null);
    setTrains([]);
    setSearch('');
    setSelectedLine(null);
  }, [setStartStation, setEndStation]);

  // 3. Stations Processing
  const { sectionedStations, popularStations } = useMemo(() => {
    const enrichedStations = stations.map(s => ({
      id: s.sta_id,
      name: s.sta_name,
      line: STATION_LINE_MAP[s.sta_id] || 'Unknown'
    }));

    let list = step === 1 
      ? enrichedStations 
      : enrichedStations.filter((s) => s.id !== startStation);
    
    if (step === 2 && startStation) {
      const startLineName = STATION_LINE_MAP[startStation];
      list = list.filter(s => s.line !== startLineName);
    }
    
    if (selectedLine) {
      list = list.filter(s => s.line === selectedLine);
    }

    const popularIds = ['MRI', 'SUD', 'THB', 'JAKK', 'BKS', 'BOO'];
    let popular = enrichedStations.filter(s => popularIds.includes(s.id));

    if (step === 2 && startStation) {
      const startLineName = STATION_LINE_MAP[startStation];
      popular = popular.filter(s => s.line !== startLineName);
    }

    if (search.trim()) {
      const filtered = list.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase())
      );
      return { sectionedStations: [{ title: 'HASIL PENCARIAN', data: filtered }], popularStations: [] };
    }

    const lines = ['Bogor', 'Cikarang', 'Rangkasbitung', 'Tangerang', 'TanjungPriok'];
    const sections = lines.map(line => ({
      title: `${line.toUpperCase()} LINE`,
      data: list.filter(s => s.line === line && !popularIds.includes(s.id))
    })).filter(section => section.data.length > 0);

    return { sectionedStations: sections, popularStations: popular };
  }, [stations, search, step, startStation, selectedLine]);

  useEffect(() => {
    if (step === 2 && endStation && startStation) {
      handleFetchTrains(startStation, endStation, transitStation);
    }
  }, [step, endStation, startStation, transitStation, handleFetchTrains]);

  return {
    step,
    setStep,
    loading: loading || loadingStations,
    trains,
    search,
    setSearch,
    selectedLine,
    setSelectedLine,
    filteredStations: sectionedStations,
    popularStations,
    startStationName,
    endStationName,
    handleStationSelect,
    transitStation,
    startLine,
    endLine,
    startStation,
    endStation,
    setActiveTrain,
    goBack,
    resetToStart,
  };
};
