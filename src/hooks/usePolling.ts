import { useEffect, useRef, useState } from 'react';
import { useTransit } from '../context/TransitContext';
import { fetchStationSchedule, fetchTrainSchedule } from '../services/kciApi';
import { ScheduleItem } from '../types/train';
import { getTimeRangeFromBase, addMinutesToTimeStr } from '../utils/timeHelper';
import { calculateWarMode, getCurrentLineFromTrain, getTransitStation, isCorrectDirection } from '../utils/transitLogic';

export const usePolling = () => {
  const {
    startStation,
    endStation,
    activeTrain,
    setActiveTrainSchedule,
    setWarModeResult,
    setTransitSchedule,
    missedTrainIds,
    setIsOffline,
    delayMinutes,
    warModeResult
  } = useTransit();

  const [pollingInterval, setPollingInterval] = useState(15000); // Default 15s
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 🚨 POINT 2: Dynamic Polling Rate Calculation
  useEffect(() => {
    if (!warModeResult) {
      setPollingInterval(15000); // Setup mode
      return;
    }

    const diff = warModeResult.kalkulasi.selisih_menit;
    const mode = warModeResult.ui_trigger.mode;

    if (mode === 'RUN_MODE' || mode === 'WAR_MODE' || diff <= 3) {
      setPollingInterval(10000); // Super active (10s)
    } else if (mode === 'HURRY_MODE' || diff <= 10) {
      setPollingInterval(30000); // Warning (30s)
    } else {
      setPollingInterval(60000); // Chill (1 min)
    }
  }, [warModeResult]);

  useEffect(() => {
    if (!startStation || !endStation || !activeTrain) return;

    const fetchData = async () => {
      try {
        console.log(`[Polling] Fetching with interval: ${pollingInterval}ms`);
        const rawTrainDetails: ScheduleItem[] = await fetchTrainSchedule(activeTrain.train_id);
        
        const trainDetails = rawTrainDetails.map(item => ({
          ...item,
          time_est: addMinutesToTimeStr(item.time_est, delayMinutes)
        }));
        
        setActiveTrainSchedule(trainDetails);

        const currentLine = getCurrentLineFromTrain(trainDetails);
        const transitStation = getTransitStation(currentLine, endStation);

        const arrivalTargetId = transitStation || endStation;
        const arrivalAtTarget = trainDetails.find(t => t.station_id === arrivalTargetId);

         if (!arrivalAtTarget) {
           return;
         }

         const arrivalTime = arrivalAtTarget.time_est;
         let validConnections: ScheduleItem[] = [];
         
         if (transitStation) {
           const { timeFrom, timeTo } = getTimeRangeFromBase(arrivalTime, 3);
           const rawSchedules: ScheduleItem[] = await fetchStationSchedule(transitStation, timeFrom, timeTo);

           validConnections = rawSchedules.filter(s => 
             isCorrectDirection(s.dest || s.route_name || '', endStation)
           );
           setTransitSchedule(validConnections);
         } else {
           setTransitSchedule([]);
         }

         const result = calculateWarMode(trainDetails, validConnections, transitStation, endStation, missedTrainIds);

         if (result) {
           setWarModeResult(result);
         }

         setIsOffline(false);

      } catch (err) {
        console.warn('Polling error:', err);
        setIsOffline(true);
      }
    };

    fetchData();
    intervalRef.current = setInterval(fetchData, pollingInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startStation, endStation, activeTrain, missedTrainIds, delayMinutes, pollingInterval, setWarModeResult, setTransitSchedule, setActiveTrainSchedule, setIsOffline]);
};
