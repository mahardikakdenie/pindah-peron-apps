export interface RouteSegment {
  station_id: string;
  name: string;
  line: string;
}

export const TRANSIT_MAP: Record<string, string[]> = {
  // Cikarang Line (Blue)
  BKS: ['KRI', 'CUK', 'KLDB', 'BUA', 'KLD', 'JNG', 'MTR', 'MRI'],
  MRI: ['SUD', 'SUDB', 'KAT', 'THB', 'DU', 'AK', 'KPB', 'RJW', 'KMO', 'PSE', 'GST', 'KMT', 'POK'],

  // Bogor Line (Red)
  JAKK: ['JAY', 'MGB', 'SW', 'JUA', 'GDD', 'CKI', 'MRI'],
  MRI_BOGOR: ['TEB', 'CW', 'DRN', 'PSMB', 'PSM', 'TNT', 'LNA', 'UP', 'UI', 'POC', 'DPB', 'DP', 'CTA', 'BJD', 'CLT', 'BOO'],
};

export const findPath = (start: string, end: string): string[] => {
  // Logic sederhana: cek apakah perlu transit di MRI
  // In real app, use BFS/Dijkstra
  if ((start === 'BKS' && end === 'JAKK') || (start === 'BOO' && end === 'JAKK')) {
    return [start, 'MRI', end];
  }
  return [start, end];
};
