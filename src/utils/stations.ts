export interface Station {
  id: string;
  name: string;
  line: 'Cikarang' | 'Bogor' | 'Tangerang' | 'Rangkasbitung' | 'TanjungPriok';
}

export const STATIONS: Station[] = [
  // Bogor Line
  { id: 'JAKK', name: 'Jakarta Kota', line: 'Bogor' },
  { id: 'JAY', name: 'Jayakarta', line: 'Bogor' },
  { id: 'MGB', name: 'Mangga Besar', line: 'Bogor' },
  { id: 'SW', name: 'Sawah Besar', line: 'Bogor' },
  { id: 'JUA', name: 'Juanda', line: 'Bogor' },
  { id: 'GDD', name: 'Gondangdia', line: 'Bogor' },
  { id: 'CIK', name: 'Cikini', line: 'Bogor' },
  { id: 'MRI', name: 'Manggarai', line: 'Bogor' },
  { id: 'TEB', name: 'Tebet', line: 'Bogor' },
  { id: 'CW', name: 'Cawang', line: 'Bogor' },
  { id: 'DRN', name: 'Duren Kalibata', line: 'Bogor' },
  { id: 'PSMB', name: 'Pasar Minggu Baru', line: 'Bogor' },
  { id: 'PSM', name: 'Pasar Minggu', line: 'Bogor' },
  { id: 'TNT', name: 'Tanjung Barat', line: 'Bogor' },
  { id: 'LNA', name: 'Lenteng Agung', line: 'Bogor' },
  { id: 'UP', name: 'Universitas Pancasila', line: 'Bogor' },
  { id: 'UI', name: 'Universitas Indonesia', line: 'Bogor' },
  { id: 'POC', name: 'Pondok Cina', line: 'Bogor' },
  { id: 'DPB', name: 'Depok Baru', line: 'Bogor' },
  { id: 'DP', name: 'Depok', line: 'Bogor' },
  { id: 'CTA', name: 'Citayam', line: 'Bogor' },
  { id: 'BJD', name: 'Bojong Gede', line: 'Bogor' },
  { id: 'CLT', name: 'Cilebut', line: 'Bogor' },
  { id: 'BOO', name: 'Bogor', line: 'Bogor' },
  { id: 'CBN', name: 'Cibinong', line: 'Bogor' },
  { id: 'NMO', name: 'Nambo', line: 'Bogor' },

  // Cikarang Line
  { id: 'CKR', name: 'Cikarang', line: 'Cikarang' },
  { id: 'MTM', name: 'Metland Telagamurni', line: 'Cikarang' },
  { id: 'CIT', name: 'Cibitung', line: 'Cikarang' },
  { id: 'TB', name: 'Tambun', line: 'Cikarang' },
  { id: 'BKSB', name: 'Bekasi Timur', line: 'Cikarang' },
  { id: 'BKS', name: 'Bekasi', line: 'Cikarang' },
  { id: 'KRI', name: 'Kranji', line: 'Cikarang' },
  { id: 'CUK', name: 'Cakung', line: 'Cikarang' },
  { id: 'KLDB', name: 'Klender Baru', line: 'Cikarang' },
  { id: 'BUA', name: 'Buaran', line: 'Cikarang' },
  { id: 'KLD', name: 'Klender', line: 'Cikarang' },
  { id: 'JNG', name: 'Jatinegara', line: 'Cikarang' },
  { id: 'MTR', name: 'Matraman', line: 'Cikarang' },
  { id: 'POK', name: 'Pondok Jati', line: 'Cikarang' },
  { id: 'KMT', name: 'Kramat', line: 'Cikarang' },
  { id: 'GST', name: 'Gang Sentiong', line: 'Cikarang' },
  { id: 'PSE', name: 'Pasar Senen', line: 'Cikarang' },
  { id: 'KMO', name: 'Kemayoran', line: 'Cikarang' },
  { id: 'RJW', name: 'Rajawali', line: 'Cikarang' },
  { id: 'KPB', name: 'Kampung Bandan', line: 'Cikarang' },
  { id: 'AK', name: 'Angke', line: 'Cikarang' },
  { id: 'DU', name: 'Duri', line: 'Cikarang' },
  { id: 'THB', name: 'Tanah Abang', line: 'Cikarang' },
  { id: 'KAT', name: 'Karet', line: 'Cikarang' },
  { id: 'SUDB', name: 'Sudirman Baru (BNI City)', line: 'Cikarang' },
  { id: 'SUD', name: 'Sudirman', line: 'Cikarang' },

  // Rangkasbitung Line
  { id: 'RK', name: 'Rangkasbitung', line: 'Rangkasbitung' },
  { id: 'CTR', name: 'Citeras', line: 'Rangkasbitung' },
  { id: 'MJ', name: 'Maja', line: 'Rangkasbitung' },
  { id: 'CKO', name: 'Cikoya', line: 'Rangkasbitung' },
  { id: 'TGS', name: 'Tigaraksa', line: 'Rangkasbitung' },
  { id: 'TEN', name: 'Tenjo', line: 'Rangkasbitung' },
  { id: 'DAR', name: 'Daru', line: 'Rangkasbitung' },
  { id: 'CJT', name: 'Cilejit', line: 'Rangkasbitung' },
  { id: 'PRP', name: 'Parung Panjang', line: 'Rangkasbitung' },
  { id: 'CC', name: 'Cicayur', line: 'Rangkasbitung' },
  { id: 'CIS', name: 'Cisauk', line: 'Rangkasbitung' },
  { id: 'SRP', name: 'Serpong', line: 'Rangkasbitung' },
  { id: 'RU', name: 'Rawa Buntu', line: 'Rangkasbitung' },
  { id: 'SDM', name: 'Sudimara', line: 'Rangkasbitung' },
  { id: 'JMG', name: 'Jurangmangu', line: 'Rangkasbitung' },
  { id: 'PDJ', name: 'Pondok Ranji', line: 'Rangkasbitung' },
  { id: 'KBY', name: 'Kebayoran', line: 'Rangkasbitung' },
  { id: 'PLM', name: 'Palmerah', line: 'Rangkasbitung' },

  // Tangerang Line
  { id: 'TNG', name: 'Tangerang', line: 'Tangerang' },
  { id: 'BPR', name: 'Batu Ceper', line: 'Tangerang' },
  { id: 'PI', name: 'Poris', line: 'Tangerang' },
  { id: 'KJD', name: 'Kalideres', line: 'Tangerang' },
  { id: 'RWB', name: 'Rawa Buaya', line: 'Tangerang' },
  { id: 'BOI', name: 'Bojong Indah', line: 'Tangerang' },
  { id: 'TKO', name: 'Taman Kota', line: 'Tangerang' },
  { id: 'PSG', name: 'Pesing', line: 'Tangerang' },
  { id: 'GF', name: 'Grogol', line: 'Tangerang' },

  // Tanjung Priok Line
  { id: 'TPK', name: 'Tanjung Priok', line: 'TanjungPriok' },
  { id: 'AC', name: 'Ancol', line: 'TanjungPriok' },
];

export const STATION_LINE_MAP: Record<string, string> = Object.fromEntries(STATIONS.map(s => [s.id, s.line]));

export const getLineColor = (line: string) => {
  switch (line) {
    case 'Bogor': return '#E30A16';
    case 'Cikarang': return '#0084D8';
    case 'Rangkasbitung': return '#22C55E';
    case 'Tangerang': return '#A855F7';
    case 'TanjungPriok': return '#EC4899';
    default: return '#9CA3AF';
  }
};
