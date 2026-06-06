import { ScheduleItem, TransitMode, TransitResult, WarModeResult } from '../types/train';
import { getMinuteDiff } from './timeHelper';
import { STATION_LINE_MAP } from './stations';

/**
 * Expert Transit Logic based on docs/maps.md
 */
export const getTransitStation = (startStation: string, endStation: string): string | null => {
  const startLine = STATION_LINE_MAP[startStation];
  const endLine = STATION_LINE_MAP[endStation];

  if (!startLine || !endLine || startLine === endLine) return null;

  const rules: Record<string, string> = {
    'Bogor-Cikarang': 'MRI',
    'Cikarang-Bogor': 'MRI',
    'Rangkasbitung-Cikarang': 'THB',
    'Cikarang-Rangkasbitung': 'THB',
    'Tangerang-Cikarang': 'DU',
    'Cikarang-Tangerang': 'DU',
    'TanjungPriok-Cikarang': 'KPB',
    'Cikarang-TanjungPriok': 'KPB',
    'TanjungPriok-Bogor': 'JAKK',
    'Bogor-TanjungPriok': 'JAKK',
  };

  return rules[`${startLine}-${endLine}`] || null;
};

/**
 * Workflow 3 Core: Determine Mode based on flow-war.md
 */
export const determineWarMode = (minuteDiff: number, found: boolean): { mode: TransitMode, color: string, message: string } => {
  if (!found) {
    return { 
      mode: 'CHILL_MODE', 
      color: '#94A3B8', 
      message: '📡 Menunggu jadwal sambungan tersedia di radar...' 
    };
  }
  
  if (minuteDiff <= 2) {
    return { 
      mode: 'RUN_MODE', 
      color: '#EF4444', 
      message: `🚨 MODE LARI AKTIF! Kereta sambungan Anda berangkat dalam ${minuteDiff} Menit!` 
    };
  }
  if (minuteDiff <= 5) {
    return { 
      mode: 'HURRY_MODE', 
      color: '#F59E0B', 
      message: `🏃 JALAN CEPAT! Sisa waktu transit ${minuteDiff} Menit.` 
    };
  }
  return { 
    mode: 'CHILL_MODE', 
    color: '#10B981', 
    message: `🧘 SANTAI. Waktu transit masih aman (${minuteDiff} Menit).` 
  };
};

/**
 * Checks if the train destination is headed towards the user's end station
 */
export const isCorrectDirection = (destOrRoute: string, endStationId: string) => {
  // Normalize by removing spaces and making uppercase
  const text = (destOrRoute || '').toUpperCase().replace(/\s+/g, '');

  /**
   * directionKeywords:
   * Maps which destination keywords are valid for reaching a target station.
   */
  const directionKeywords: Record<string, string[]> = {
    // Bogor Line (Northbound)
    'JAKK': ['JAKARTA', 'KOTA', 'JAKARTAKOTA', 'MANGGARAI'],
    'JAY': ['JAKARTA', 'KOTA', 'JAKARTAKOTA', 'MANGGARAI'],
    'MGB': ['JAKARTA', 'KOTA', 'JAKARTAKOTA', 'MANGGARAI'],
    'SW': ['JAKARTA', 'KOTA', 'JAKARTAKOTA', 'MANGGARAI'],
    'JUA': ['JAKARTA', 'KOTA', 'JAKARTAKOTA', 'MANGGARAI'],
    'GDD': ['JAKARTA', 'KOTA', 'JAKARTAKOTA', 'MANGGARAI'],
    'CIK': ['JAKARTA', 'KOTA', 'JAKARTAKOTA', 'MANGGARAI'],
    
    // Bogor Line (Southbound)
    'BOO': ['BOGOR', 'NAMBO', 'DEPOK', 'CITAYAM'],
    'DP': ['BOGOR', 'NAMBO', 'DEPOK'],
    
    // Cikarang Line (Eastbound)
    'BKS': ['BEKASI', 'CIKARANG', 'TAMBUN'],
    'CKR': ['CIKARANG', 'BEKASI'],
    
    // Cikarang Line (Westbound/Loop)
    'KAT': ['ANGKE', 'KAMPUNGBANDAN', 'DURI', 'TANAHABANG', 'MANGGARAI'],
    'SUD': ['ANGKE', 'KAMPUNGBANDAN', 'DURI', 'TANAHABANG', 'MANGGARAI', 'BEKASI', 'CIKARANG'],
    'THB': ['ANGKE', 'KAMPUNGBANDAN', 'TANAHABANG', 'RANGKASBITUNG', 'MANGGARAI'],
    'DU': ['ANGKE', 'KAMPUNGBANDAN', 'DURI', 'TANGERANG', 'MANGGARAI'],

    // Manggarai (Central Junction) - Should accept any train heading towards it
    'MRI': ['JAKARTA', 'KOTA', 'ANGKE', 'KAMPUNGBANDAN', 'BEKASI', 'CIKARANG', 'BOGOR', 'DEPOK', 'MANGGARAI'],
  };

  const specificKeywords = directionKeywords[endStationId];
  if (specificKeywords) {
    return specificKeywords.some(k => text.includes(k.replace(/\s+/g, '')));
  }

  // Fallback: Just check if destination contains the station ID or name
  return text.includes(endStationId.replace(/\s+/g, ''));
};

/**
 * CORE LOGIC ENGINE (flow-war.md)
 * Orchestrates Workflow 1, 2, and 3
 */
export const calculateWarMode = (
  trainDetails: ScheduleItem[], // From fetchTrainSchedule
  transitSchedules: ScheduleItem[], // From fetchStationSchedule at transit point
  transitStationId: string,
  endStationId: string
): WarModeResult | null => {
  
  // WORKFLOW 1: EKSTRAKSI DETAIL JALUR KERETA
  if (!trainDetails || trainDetails.length === 0) return null;
  const first = trainDetails[0];

  // WORKFLOW 2: IDENTIFIKASI WAKTU TIBA DI STASIUN TRANSIT
  const arrivalAtTransit = trainDetails.find(s => s.station_id === transitStationId);
  if (!arrivalAtTransit) return null;

  // WORKFLOW 3: KALKULASI SAMBUNGAN & TRIGGER "WAR MODE"
  const connections = transitSchedules
    .filter(s => {
      const diff = getMinuteDiff(arrivalAtTransit.time_est, s.time_est);
      return (
        s.train_id !== arrivalAtTransit.train_id &&
        diff > 0 && // Filter out impossible connections (Workflow 3 logic)
        isCorrectDirection(s.dest || s.route_name || '', endStationId)
      );
    })
    .sort((a, b) => (a.time_est < b.time_est ? -1 : 1));

  const found = connections.length > 0;
  const nextTrain = connections[0];
  const minuteDiff = found ? getMinuteDiff(arrivalAtTransit.time_est, nextTrain.time_est) : 0;
  const ui = determineWarMode(minuteDiff, found);

  return {
    success: true,
    train_identity: {
      train_id: first.train_id,
      ka_name: first.ka_name || 'KRL',
      line_color: first.color || '#1e293b'
    },
    transit_analysis: {
      transit_station_id: transitStationId,
      transit_station_name: arrivalAtTransit.station_name || transitStationId,
      waktu_tiba_estimasi: arrivalAtTransit.time_est
    },
    connecting_train: {
      found,
      train_id_sambungan: nextTrain?.train_id || '-',
      destinasi: nextTrain?.dest || '-',
      waktu_berangkat_estimasi: nextTrain?.time_est || '-'
    },
    kalkulasi: {
      selisih_menit: found ? minuteDiff : 0
    },
    ui_trigger: {
      mode: ui.mode,
      color_code: ui.color,
      vibrate: ui.mode === 'RUN_MODE',
      message: ui.message
    }
  };
};

// Legacy support (to avoid breaking existing imports until refactored)
export const checkTransitStatus = (
  transitSchedules: ScheduleItem[],
  arrivalTrainAtTransit: ScheduleItem,
  endStationId: string,
): TransitResult | null => {
  const connections = transitSchedules
    .filter(s => {
      const diff = getMinuteDiff(arrivalTrainAtTransit.time_est, s.time_est);
      return (
        s.train_id !== arrivalTrainAtTransit.train_id &&
        diff > 0 && // Skip 0 minute connections
        isCorrectDirection(s.dest || s.route_name || '', endStationId)
      );
    })
    .sort((a, b) => (a.time_est < b.time_est ? -1 : 1));

  if (connections.length === 0) return null;

  const nextTrain = connections[0];
  const minuteDiff = getMinuteDiff(arrivalTrainAtTransit.time_est, nextTrain.time_est);

  return {
    mode: minuteDiff <= 2 ? 'RUN_MODE' : minuteDiff <= 5 ? 'HURRY_MODE' : 'CHILL_MODE',
    minuteDiff,
    arrivalTrain: arrivalTrainAtTransit,
    nextTrain,
  };
};
