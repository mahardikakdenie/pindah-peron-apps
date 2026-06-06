export interface ScheduleItem {
  station_id: string;
  station_name?: string;
  time_est: string;
  train_id: string;
  dest: string;
  platform?: string;
  route: string;
  transit_station?: boolean;
  transit?: string[];
  ka_name?: string;
  color?: string;
  route_name?: string;
}

export interface StationSchedule {
  stationId: string;
  schedules: ScheduleItem[];
}

export type TransitMode = 'RUN_MODE' | 'HURRY_MODE' | 'CHILL_MODE' | 'WAR_MODE';

export interface WarModeResult {
  success: boolean;
  train_identity: {
    train_id: string;
    ka_name: string;
    line_color: string;
  };
  transit_analysis: {
    transit_station_id: string;
    transit_station_name: string;
    waktu_tiba_estimasi: string;
  };
  connecting_train: {
    found: boolean;
    train_id_sambungan: string;
    destinasi: string;
    waktu_berangkat_estimasi: string;
  };
  kalkulasi: {
    selisih_menit: number;
  };
  ui_trigger: {
    mode: TransitMode;
    color_code: string;
    vibrate: boolean;
    message: string;
  };
}

export interface TransitResult {
  mode: TransitMode;
  minuteDiff: number;
  arrivalTrain: ScheduleItem;
  nextTrain: ScheduleItem;
}
