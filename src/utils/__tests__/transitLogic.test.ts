import { 
  getTransitStation, 
  isCorrectDirection, 
  calculateWarMode 
} from '../transitLogic';
import { isStrictCorrectDirection } from '../directionalFilter';
import { ScheduleItem } from '../../types/train';

describe('Transit Logic Engine', () => {
  describe('getTransitStation', () => {
    it('should recommend Manggarai (MRI) for Bogor Line to a Cikarang Line station', () => {
      // BKS (Bekasi) is on Cikarang Line
      expect(getTransitStation('Bogor', 'BKS')).toBe('MRI');
    });

    it('should recommend Tanah Abang (THB) for Cikarang Line to a Rangkasbitung Line station', () => {
      // RK (Rangkasbitung) is on Rangkasbitung Line
      expect(getTransitStation('Cikarang', 'RK')).toBe('THB');
    });

    it('should return null for same line travel', () => {
      // JAKK is on Bogor Line
      expect(getTransitStation('Bogor', 'JAKK')).toBeNull();
    });
  });

  describe('isCorrectDirection (Logic Gateway)', () => {
    it('should identify Jakarta Kota as a valid gateway for Bogor Line target', () => {
      // If user is going to Gondangdia (GDD - Bogor Line), a train to Jakarta Kota is correct.
      expect(isCorrectDirection('JAKARTA KOTA', 'GDD')).toBe(true);
    });

    it('should identify Angke as a valid gateway for Rangkasbitung via THB', () => {
      // To get to Rangkasbitung (RK), a loop line train to Angke/KPB passes through THB.
      expect(isCorrectDirection('ANGKE', 'RK')).toBe(true);
    });
  });

  describe('isStrictCorrectDirection (Physical Direction)', () => {
    it('should allow Southbound train when user is moving South on Bogor Line', () => {
      // User at Pasar Minggu (PSM) going to Depok (DP) -> index of DP (19) > index of PSM (12) -> FORWARD/South
      // Train to Bogor (BOO) -> Southbound terminal
      expect(isStrictCorrectDirection('BOGOR', 'PSM', 'DP')).toBe(true);
    });

    it('should block Northbound train when user is moving South on Bogor Line', () => {
      // User at Pasar Minggu (PSM) going to Depok (DP) -> South
      // Train to Jakarta Kota (JAKK) -> Northbound terminal
      expect(isStrictCorrectDirection('JAKARTA KOTA', 'PSM', 'DP')).toBe(false);
    });
  });

  describe('calculateWarMode', () => {
    const mockTrainDetails: ScheduleItem[] = [
      { train_id: '1151', station_id: 'PSM', time_est: '04:00:00', dest: 'JAKK', route: 'BOGOR-JAKK' },
      { train_id: '1151', station_id: 'MRI', time_est: '04:20:00', dest: 'JAKK', route: 'BOGOR-JAKK' },
    ];

    const mockTransitSchedules: ScheduleItem[] = [
      { train_id: '5001', station_id: 'MRI', time_est: '04:22:00', dest: 'ANGKE', ka_name: 'CIKARANG LINE', route: 'CKR-ANGKE' }, // 2 mins diff
      { train_id: '5002', station_id: 'MRI', time_est: '04:30:00', dest: 'ANGKE', ka_name: 'CIKARANG LINE', route: 'CKR-ANGKE' }, // 10 mins diff
    ];

    it('should trigger RUN_MODE when connection is in 2 minutes', () => {
      // KAT (Karet) is in Cikarang Line
      const result = calculateWarMode(mockTrainDetails, mockTransitSchedules, 'MRI', 'KAT'); 
      expect(result?.ui_trigger.mode).toBe('RUN_MODE');
      expect(result?.kalkulasi.selisih_menit).toBe(2);
    });

    it('should trigger CHILL_MODE if we skip the first train (missedTrainIds)', () => {
      const result = calculateWarMode(mockTrainDetails, mockTransitSchedules, 'MRI', 'KAT', ['5001']);
      expect(result?.ui_trigger.mode).toBe('CHILL_MODE');
      expect(result?.kalkulasi.selisih_menit).toBe(10);
      expect(result?.connecting_train.train_id_sambungan).toBe('5002');
    });
  });
});
