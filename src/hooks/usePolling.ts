import { useEffect, useRef } from 'react';
import { useTransit } from '../context/TransitContext';
import { fetchStationSchedule, fetchTrainSchedule } from '../services/kciApi';
import { ScheduleItem } from '../types/train';
import { getTimeRangeFromBase } from '../utils/timeHelper';
import { calculateWarMode, getTransitStation, isCorrectDirection } from '../utils/transitLogic';

const POLL_INTERVAL = 10000;

export const usePolling = () => {
  const {
    startStation,
    endStation,
    activeTrain,
    setActiveTrainSchedule,
    setWarModeResult,
    setTransitSchedule,
  } = useTransit();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!startStation || !endStation || !activeTrain) return;

    const fetchData = async () => {
      try {
        /**
         * 🔄 WORKFLOW 1: EKSTRAKSI DETAIL JALUR KERETA
         * Mendapatkan urutan stasiun untuk kereta yang sedang dinaiki.
         */
        const trainDetails: ScheduleItem[] = await fetchTrainSchedule(activeTrain.train_id);
        setActiveTrainSchedule(trainDetails);

        /**
         * 🔄 WORKFLOW 2: IDENTIFIKASI WAKTU TIBA DI STASIUN TRANSIT
         * Menentukan di mana user harus transit dan jam berapa tiba di sana.
         */
        const transitStation = getTransitStation(startStation, endStation);
        if (!transitStation) return;

        const arrivalAtTransit = trainDetails.find(t => t.station_id === transitStation);
        if (!arrivalAtTransit) {
          console.warn(`[War Engine] Kereta KA ${activeTrain.train_id} tidak/belum melewati ${transitStation}`);
          return;
        }

        const arrivalTime = arrivalAtTransit.time_est;

        /**
         * 🔄 WORKFLOW 3: KALKULASI SAMBUNGAN & TRIGGER "WAR MODE"
         * Fetch jadwal di stasiun transit dan filter hanya yang sejalur dengan tujuan akhir.
         */
        const { timeFrom, timeTo } = getTimeRangeFromBase(arrivalTime, 3);
        const rawSchedules: ScheduleItem[] = await fetchStationSchedule(transitStation, timeFrom, timeTo);

        // Filter: Hanya ambil kereta yang sejalur dengan tujuan akhir user (Smart Filtering)
        const validConnections = rawSchedules.filter(s => 
          isCorrectDirection(s.dest || s.route_name || '', endStation)
        );

        // Update context dengan jadwal yang sudah difilter (untuk tampilan radar/dashboard)
        setTransitSchedule(validConnections);

        // Jalankan Logic Engine untuk menentukan sambungan tercepat dan mode UI
        const result = calculateWarMode(trainDetails, validConnections, transitStation, endStation);
        
        if (result) {
          setWarModeResult(result);
          // Log output sesuai instruksi docs/flow-war.md (Strict JSON)
          console.log('[WAR ENGINE JSON]:', JSON.stringify(result, null, 2));
        }

      } catch (err) {
        console.warn('Polling error:', err);
      }
    };

    fetchData();
    intervalRef.current = setInterval(fetchData, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startStation, endStation, activeTrain, setWarModeResult, setTransitSchedule, setActiveTrainSchedule]);
};
