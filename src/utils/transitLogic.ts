import { ScheduleItem, TransitMode, TransitResult, WarModeResult } from '../types/train';
import { getMinuteDiff } from './timeHelper';
import { STATION_LINE_MAP } from './stations';

/**
 * Expert Transit Logic based on docs/maps.md
 */
export const getTransitStation = (currentLine: string, endStationId: string): string | null => {
  const endLine = STATION_LINE_MAP[endStationId];

  if (!currentLine || !endLine || currentLine === endLine) return null;

  const rules: Record<string, string> = {
    'Bogor-Cikarang': 'MRI',
    'Bogor-Rangkasbitung': 'MRI', 
    'Bogor-Tangerang': 'MRI',     
    'Bogor-TanjungPriok': 'JAKK', 
    'Cikarang-Bogor': 'MRI',
    'Cikarang-Rangkasbitung': 'THB',
    'Cikarang-Tangerang': 'DU',
    'Cikarang-TanjungPriok': 'KPB',
    'Rangkasbitung-Cikarang': 'THB',
    'Rangkasbitung-Bogor': 'THB',    
    'Rangkasbitung-Tangerang': 'THB', 
    'Rangkasbitung-TanjungPriok': 'THB', 
    'Tangerang-Cikarang': 'DU',
    'Tangerang-Bogor': 'DU',      
    'Tangerang-Rangkasbitung': 'DU', 
    'Tangerang-TanjungPriok': 'DU', 
    'TanjungPriok-Bogor': 'JAKK',
    'TanjungPriok-Cikarang': 'KPB',
    'TanjungPriok-Rangkasbitung': 'KPB', 
    'TanjungPriok-Tangerang': 'KPB',     
  };

  return rules[`${currentLine}-${endLine}`] || null;
};

export const getCurrentLineFromTrain = (trainDetails: ScheduleItem[]): string => {
  if (!trainDetails || trainDetails.length === 0) return 'Bogor';
  const kaName = (trainDetails[0].ka_name || '').toUpperCase();
  const route = (trainDetails[0].route_name || trainDetails[0].route || '').toUpperCase();

  if (kaName.includes('BOGOR')) return 'Bogor';
  if (kaName.includes('CIKARANG')) return 'Cikarang';
  if (kaName.includes('RANGKASBITUNG') || route.includes('RANGKAS')) return 'Rangkasbitung';
  if (kaName.includes('TANGERANG') || route.includes('TANGERANG')) return 'Tangerang';
  if (kaName.includes('PRIOK') || route.includes('PRIOK')) return 'TanjungPriok';
  return 'Bogor';
};

export const determineWarMode = (minuteDiff: number, found: boolean): { mode: TransitMode, color: string, message: string } => {
  if (!found) {
    return { mode: 'CHILL_MODE', color: '#94A3B8', message: '📡 Menunggu jadwal sambungan tersedia di radar...' };
  }
  if (minuteDiff <= 2) {
    return { mode: 'RUN_MODE', color: '#EF4444', message: `🚨 MODE LARI AKTIF! Kereta sambungan berangkat dalam ${minuteDiff} Menit!` };
  }
  if (minuteDiff <= 5) {
    return { mode: 'HURRY_MODE', color: '#F59E0B', message: `🏃 JALAN CEPAT! Sisa waktu transit ${minuteDiff} Menit.` };
  }
  return { mode: 'CHILL_MODE', color: '#10B981', message: `🧘 SANTAI. Waktu transit masih aman (${minuteDiff} Menit).` };
};

/**
 * Checks if the train destination is headed towards the user's end station
 * Optimized for multi-transit gateways (docs/image.png)
 */
export const isCorrectDirection = (destOrRoute: string, targetStationId: string) => {
  const text = (destOrRoute || '').toUpperCase().replace(/\s+/g, '');
  const targetLine = STATION_LINE_MAP[targetStationId];
  const k = (s: string) => s.toUpperCase().replace(/\s+/g, '');

  /**
   * Terminal Mapping: Terminals serving each line directly.
   */
  const lineTerminals: Record<string, string[]> = {
    'Bogor': ['JAKK', 'BOO', 'DEPOK', 'NAMBO', 'MRI', 'MANGGARAI', 'JAKARTAKOTA'],
    'Cikarang': ['CKR', 'BKS', 'ANGKE', 'KPB', 'THB', 'MRI', 'DU', 'JNG', 'MANGGARAI', 'JATINEGARA', 'TANAHABANG', 'CIKARANG', 'BEKASI', 'KAMPUNGBANDAN'],
    'Rangkasbitung': ['RK', 'PRP', 'SRP', 'THB', 'TANAHABANG', 'RANGKASBITUNG', 'PARUNGPANJANG', 'SERPONG'],
    'Tangerang': ['TNG', 'DU', 'DURI', 'TANGERANG'],
    'TanjungPriok': ['TPK', 'JAKK', 'KPB', 'TANJUNGPRIOK', 'JAKARTAKOTA', 'KAMPUNGBANDAN']
  };

  /**
   * Bridge Junctions:
   * Junctions that act as gateways to reach a target line.
   */
  const bridges: Record<string, string[]> = {
    'Rangkasbitung': ['MRI', 'ANGKE', 'KPB', 'THB', 'MANGGARAI', 'TANAHABANG', 'KAMPUNGBANDAN'],
    'Tangerang': ['MRI', 'ANGKE', 'KPB', 'DU', 'MANGGARAI', 'DURI', 'KAMPUNGBANDAN'],
    'Bogor': ['MRI', 'JAKK', 'BOO', 'MANGGARAI', 'JAKARTAKOTA', 'BOGOR'],
    'Cikarang': ['MRI', 'JNG', 'BKS', 'CKR', 'ANGKE', 'KPB', 'MANGGARAI', 'BEKASI', 'CIKARANG', 'JATINEGARA', 'KAMPUNGBANDAN']
  };

  const possible = [
    ...(lineTerminals[targetLine] || []), 
    ...(bridges[targetLine] || []), 
    targetStationId
  ].map(k);

  // LOGIC: If the train is heading to ANY of these terminals, it's considered "correct direction"
  return possible.some(d => text.includes(d));
};

export const calculateWarMode = (
  trainDetails: ScheduleItem[], 
  transitSchedules: ScheduleItem[], 
  transitStationId: string | null,
  endStationId: string,
  missedTrainIds: string[] = []
): WarModeResult | null => {
  if (!trainDetails || trainDetails.length === 0) return null;
  const first = trainDetails[0];

  if (!transitStationId) {
    const arrivalAtDest = trainDetails.find(s => s.station_id === endStationId);
    return {
      success: true,
      train_identity: { train_id: first.train_id, ka_name: first.ka_name || 'KRL', line_color: first.color || '#1e293b' },
      transit_analysis: { transit_station_id: '', transit_station_name: 'DIRECT ROUTE', waktu_tiba_estimasi: arrivalAtDest?.time_est || '-' },
      connecting_train: { found: false, train_id_sambungan: '-', destinasi: '-', waktu_berangkat_estimasi: '-' },
      kalkulasi: { selisih_menit: 0 },
      ui_trigger: { mode: 'CHILL_MODE', color_code: '#10B981', vibrate: false, message: '🧘 RUTE LANGSUNG. Nikmati perjalanan Anda.' }
    };
  }

  const arrivalAtTransit = trainDetails.find(s => s.station_id === transitStationId);
  if (!arrivalAtTransit) return null;

  const connections = transitSchedules
    .filter(s => {
      const diff = getMinuteDiff(arrivalAtTransit.time_est, s.time_est);
      return (
        s.train_id !== arrivalAtTransit.train_id &&
        !missedTrainIds.includes(s.train_id) && // FILTER MISSED TRAINS
        diff > 0 && 
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
    train_identity: { train_id: first.train_id, ka_name: first.ka_name || 'KRL', line_color: first.color || '#1e293b' },
    transit_analysis: { transit_station_id: transitStationId, transit_station_name: arrivalAtTransit.station_name || transitStationId, waktu_tiba_estimasi: arrivalAtTransit.time_est },
    connecting_train: { found, train_id_sambungan: nextTrain?.train_id || '-', destinasi: nextTrain?.dest || '-', waktu_berangkat_estimasi: nextTrain?.time_est || '-' },
    kalkulasi: { selisih_menit: found ? minuteDiff : 0 },
    ui_trigger: { mode: ui.mode, color_code: ui.color, vibrate: ui.mode === 'RUN_MODE', message: ui.message }
  };
};

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
        diff > 0 &&
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
