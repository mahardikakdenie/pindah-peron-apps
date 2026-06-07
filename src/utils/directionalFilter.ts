import { STATION_LINE_MAP } from './stations';
import { BOGOR_LINE_ORDER, CIKARANG_LINE_ORDER } from './routeSequence';

/**
 * STRONGER DIRECTIONAL FILTER
 * Compares User's target station against the train's terminal station.
 * Ensures the train is physically heading towards the destination station.
 */
export const isStrictCorrectDirection = (
  trainDest: string, 
  currentStationId: string, 
  targetStationId: string
): boolean => {
  const dest = (trainDest || '').toUpperCase().replace(/\s+/g, '');
  const currentLine = STATION_LINE_MAP[currentStationId];

  // 1. Identify which sequence to use
  let lineOrder: string[] = [];
  if (currentLine === 'Bogor') lineOrder = BOGOR_LINE_ORDER;
  else if (currentLine === 'Cikarang') lineOrder = CIKARANG_LINE_ORDER;
  else return true; // Default allow for other lines

  const currentIndex = lineOrder.indexOf(currentStationId);
  const targetIndex = lineOrder.indexOf(targetStationId);

  if (currentIndex === -1) return true;

  // Determine User Direction
  const effectiveTargetIndex = targetIndex !== -1 ? targetIndex : lineOrder.indexOf('MRI');
  const userDirection = effectiveTargetIndex > currentIndex ? 'FORWARD' : 'BACKWARD';

  // 2. Identify Train Direction based on its Destination terminal
  if (currentLine === 'Bogor') {
    const isSouthboundTrain = ['BOO', 'BOGOR', 'DEPOK', 'DP', 'CITAYAM', 'CTA', 'NAMBO', 'NMO'].some(k => dest.includes(k));
    const isNorthboundTrain = ['JAKARTA', 'KOTA', 'JAKK', 'MANGGARAI', 'MRI'].some(k => dest.includes(k));

    if (userDirection === 'FORWARD') return isSouthboundTrain;
    if (userDirection === 'BACKWARD') return isNorthboundTrain;
  }

  // For Cikarang Line, we fallback for now due to complex loop
  return true;
};
