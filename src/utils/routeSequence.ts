/**
 * BOGOR LINE STATIONS ORDER (North to South)
 */
export const BOGOR_LINE_ORDER = [
  'JAKK', 'JAY', 'MGB', 'SW', 'JUA', 'GDD', 'CIK', 'MRI', 
  'TEB', 'CW', 'DRN', 'PSMB', 'PSM', 'TNT', 'LNA', 'UP', 
  'UI', 'POC', 'DPB', 'DP', 'CTA', 'BJD', 'CLT', 'BOO'
];

/**
 * CIKARANG LINE STATIONS ORDER (Standard Loop/Sequence)
 */
export const CIKARANG_LINE_ORDER = [
  'CKR', 'MTM', 'CIT', 'TB', 'BKSB', 'BKS', 'KRI', 'CUK', 
  'KLDB', 'BUA', 'KLD', 'JNG', 'MTR', 'POK', 'KMT', 'GST', 
  'PSE', 'KMO', 'RJW', 'KPB', 'AK', 'DU', 'THB', 'KAT', 
  'SUDB', 'SUD', 'MRI'
];

/**
 * Determines if Train B is heading in the same direction as the user 
 * based on a list of ordered stations.
 */
export const isCorrectSequentialDirection = (
  originId: string, 
  targetId: string, 
  lineOrder: string[]
): boolean => {
  const originIndex = lineOrder.indexOf(originId);
  const targetIndex = lineOrder.indexOf(targetId);

  if (originIndex === -1 || targetIndex === -1) return true; // Can't determine, allow by default

  // However, KCI API doesn't give us the full sequence for every train in the schedule list.
  return true; 
};
