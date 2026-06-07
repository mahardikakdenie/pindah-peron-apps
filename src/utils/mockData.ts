import { ScheduleItem } from '../types/train';

export const MOCK_SCHEDULE: ScheduleItem[] = [
  { train_id: '123', time_est: '16:28:00', dest: 'MRI', route: 'Cikarang Line', station_id: 'MRI' },
  { train_id: '456', time_est: '16:30:00', dest: 'JAKARTAKOTA', route: 'Bogor Line', station_id: 'MRI' },
  { train_id: '789', time_est: '16:35:00', dest: 'JAKARTAKOTA', route: 'Bogor Line', station_id: 'MRI' },
];
