export interface MapPoint {
  id: string;
  name: string;
  line: string;
  x: number;
  y: number;
  isTransit?: boolean;
}

/**
 * RECTILINEAR COORDINATES (Official Diagram Style)
 * MANGGARAI (MRI) is the anchor point.
 */
export const CENTER_X = 1000;
export const CENTER_Y = 1000;
const V_STEP = 60;  // Vertical spacing
const H_STEP = 120; // Horizontal spacing

export const MAP_POINTS: MapPoint[] = [
  // --- BOGOR LINE (Central Vertical) ---
  { id: 'JAKK', name: 'Jakarta Kota', line: 'Bogor', x: CENTER_X - H_STEP, y: CENTER_Y - (V_STEP * 8), isTransit: true },
  { id: 'JAY',  name: 'Jayakarta',    line: 'Bogor', x: CENTER_X - H_STEP, y: CENTER_Y - (V_STEP * 7) },
  { id: 'MGB',  name: 'Mangga Besar', line: 'Bogor', x: CENTER_X - H_STEP, y: CENTER_Y - (V_STEP * 6) },
  { id: 'SW',   name: 'Sawah Besar',  line: 'Bogor', x: CENTER_X - H_STEP, y: CENTER_Y - (V_STEP * 5) },
  { id: 'JUA',  name: 'Juanda',       line: 'Bogor', x: CENTER_X - H_STEP, y: CENTER_Y - (V_STEP * 4) },
  { id: 'GDD',  name: 'Gondangdia',   line: 'Bogor', x: CENTER_X - H_STEP, y: CENTER_Y - (V_STEP * 3) },
  { id: 'CIK',  name: 'Cikini',       line: 'Bogor', x: CENTER_X - H_STEP, y: CENTER_Y - (V_STEP * 2) },
  
  // MANGGARAI (Pivot)
  { id: 'MRI',  name: 'Manggarai',    line: 'Bogor', x: CENTER_X, y: CENTER_Y, isTransit: true },
  
  // South Bogor
  { id: 'TEB',  name: 'Tebet',        line: 'Bogor', x: CENTER_X, y: CENTER_Y + V_STEP },
  { id: 'CW',   name: 'Cawang',       line: 'Bogor', x: CENTER_X, y: CENTER_Y + (V_STEP * 2) },
  { id: 'DRN',  name: 'Duren Kalibata', line: 'Bogor', x: CENTER_X, y: CENTER_Y + (V_STEP * 3) },
  { id: 'PSM',  name: 'Pasar Minggu', line: 'Bogor', x: CENTER_X, y: CENTER_Y + (V_STEP * 4) },
  { id: 'DP',   name: 'Depok',        line: 'Bogor', x: CENTER_X, y: CENTER_Y + (V_STEP * 6) },
  { id: 'CTA',  name: 'Citayam',      line: 'Bogor', x: CENTER_X, y: CENTER_Y + (V_STEP * 8), isTransit: true },
  { id: 'BOO',  name: 'Bogor',        line: 'Bogor', x: CENTER_X, y: CENTER_Y + (V_STEP * 11) },
  { id: 'NMO',  name: 'Nambo',        line: 'Bogor', x: CENTER_X + (H_STEP * 2), y: CENTER_Y + (V_STEP * 8) },

  // --- CIKARANG LINE (Loop + Branch) ---
  { id: 'SUD',  name: 'Sudirman',     line: 'Cikarang', x: CENTER_X - H_STEP, y: CENTER_Y },
  { id: 'KAT',  name: 'Karet',        line: 'Cikarang', x: CENTER_X - (H_STEP * 2), y: CENTER_Y },
  { id: 'THB',  name: 'Tanah Abang',  line: 'Cikarang', x: CENTER_X - (H_STEP * 3), y: CENTER_Y, isTransit: true },
  { id: 'DU',   name: 'Duri',         line: 'Cikarang', x: CENTER_X - (H_STEP * 3), y: CENTER_Y - (V_STEP * 3), isTransit: true },
  { id: 'AK',   name: 'Angke',        line: 'Cikarang', x: CENTER_X - (H_STEP * 2), y: CENTER_Y - (V_STEP * 5) },
  { id: 'KPB',  name: 'Kampung Bandan', line: 'Cikarang', x: CENTER_X - H_STEP, y: CENTER_Y - (V_STEP * 8), isTransit: true },
  { id: 'RJW',  name: 'Rajawali',     line: 'Cikarang', x: CENTER_X + (H_STEP * 2), y: CENTER_Y - (V_STEP * 8) },
  { id: 'PSE',  name: 'Pasar Senen',  line: 'Cikarang', x: CENTER_X + (H_STEP * 2), y: CENTER_Y - (V_STEP * 4) },
  { id: 'JNG',  name: 'Jatinegara',   line: 'Cikarang', x: CENTER_X + (H_STEP * 2), y: CENTER_Y, isTransit: true },
  { id: 'BKS',  name: 'Bekasi',       line: 'Cikarang', x: CENTER_X + (H_STEP * 2), y: CENTER_Y + (V_STEP * 5) },
  { id: 'CKR',  name: 'Cikarang',     line: 'Cikarang', x: CENTER_X + (H_STEP * 2), y: CENTER_Y + (V_STEP * 9) },

  // --- RANGKASBITUNG LINE ---
  { id: 'PLM',  name: 'Palmerah',     line: 'Rangkasbitung', x: CENTER_X - (H_STEP * 3), y: CENTER_Y + (V_STEP * 2) },
  { id: 'KBY',  name: 'Kebayoran',    line: 'Rangkasbitung', x: CENTER_X - (H_STEP * 3), y: CENTER_Y + (V_STEP * 4) },
  { id: 'RK',   name: 'Rangkasbitung', line: 'Rangkasbitung', x: CENTER_X - (H_STEP * 3), y: CENTER_Y + (V_STEP * 10) },

  // --- TANGERANG LINE ---
  { id: 'GF',   name: 'Grogol',       line: 'Tangerang', x: CENTER_X - (H_STEP * 4.5), y: CENTER_Y - (V_STEP * 3) },
  { id: 'TNG',  name: 'Tangerang',    line: 'Tangerang', x: CENTER_X - (H_STEP * 7), y: CENTER_Y - (V_STEP * 3) },

  // --- PRIOK LINE ---
  { id: 'AC',   name: 'Ancol',        line: 'TanjungPriok', x: CENTER_X + H_STEP, y: CENTER_Y - (V_STEP * 8) },
  { id: 'TPK',  name: 'Tanjung Priok', line: 'TanjungPriok', x: CENTER_X + (H_STEP * 3), y: CENTER_Y - (V_STEP * 8) },
];

export const MAP_CONNECTIONS = [
  // Bogor Line
  ['JAKK', 'JAY'], ['JAY', 'MGB'], ['MGB', 'SW'], ['SW', 'JUA'], ['JUA', 'GDD'], ['GDD', 'CIK'], ['CIK', 'MRI'], ['MRI', 'TEB'], ['TEB', 'CW'], ['CW', 'DRN'], ['DRN', 'PSM'], ['PSM', 'DP'], ['DP', 'CTA'], ['CTA', 'BOO'], ['CTA', 'NMO'],
  // Cikarang Loop
  ['MRI', 'SUD'], ['SUD', 'KAT'], ['KAT', 'THB'], ['THB', 'DU'], ['DU', 'AK'], ['AK', 'KPB'], ['KPB', 'RJW'], ['RJW', 'PSE'], ['PSE', 'JNG'], ['JNG', 'MRI'],
  // Cikarang Branch
  ['JNG', 'BKS'], ['BKS', 'CKR'],
  // Rangkas
  ['THB', 'PLM'], ['PLM', 'KBY'], ['KBY', 'RK'],
  // Tangerang
  ['DU', 'GF'], ['GF', 'TNG'],
  // Priok
  ['KPB', 'AC'], ['AC', 'TPK'],
];
