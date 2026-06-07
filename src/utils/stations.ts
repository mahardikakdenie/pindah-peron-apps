export const STATION_LINE_MAP: Record<string, string> = {
  // Bogor Line
  'JAKK': 'Bogor', 'JAY': 'Bogor', 'MGB': 'Bogor', 'SW': 'Bogor', 'JUA': 'Bogor', 'GDD': 'Bogor', 'CIK': 'Bogor', 'MRI': 'Bogor', 'TEB': 'Bogor', 'CW': 'Bogor', 'DRN': 'Bogor', 'PSMB': 'Bogor', 'PSM': 'Bogor', 'TNT': 'Bogor', 'LNA': 'Bogor', 'UP': 'Bogor', 'UI': 'Bogor', 'POC': 'Bogor', 'DPB': 'Bogor', 'DP': 'Bogor', 'CTA': 'Bogor', 'BJD': 'Bogor', 'CLT': 'Bogor', 'BOO': 'Bogor', 'CBN': 'Bogor', 'NMO': 'Bogor',

  // Cikarang Line
  'CKR': 'Cikarang', 'MTM': 'Cikarang', 'CIT': 'Cikarang', 'TB': 'Cikarang', 'BKSB': 'Cikarang', 'BKS': 'Cikarang', 'KRI': 'Cikarang', 'CUK': 'Cikarang', 'KLDB': 'Cikarang', 'BUA': 'Cikarang', 'KLD': 'Cikarang', 'JNG': 'Cikarang', 'MTR': 'Cikarang', 'POK': 'Cikarang', 'KMT': 'Cikarang', 'GST': 'Cikarang', 'PSE': 'Cikarang', 'KMO': 'Cikarang', 'RJW': 'Cikarang', 'KPB': 'Cikarang', 'AK': 'Cikarang', 'DU': 'Cikarang', 'THB': 'Cikarang', 'KAT': 'Cikarang', 'SUDB': 'Cikarang', 'SUD': 'Cikarang',

  // Rangkasbitung Line
  'RK': 'Rangkasbitung', 'CTR': 'Rangkasbitung', 'MJ': 'Rangkasbitung', 'CKO': 'Rangkasbitung', 'TGS': 'Rangkasbitung', 'TEN': 'Rangkasbitung', 'DAR': 'Rangkasbitung', 'CJT': 'Rangkasbitung', 'PRP': 'Rangkasbitung', 'CC': 'Rangkasbitung', 'CIS': 'Rangkasbitung', 'SRP': 'Rangkasbitung', 'RU': 'Rangkasbitung', 'SDM': 'Rangkasbitung', 'JMG': 'Rangkasbitung', 'PDJ': 'Rangkasbitung', 'KBY': 'Rangkasbitung', 'PLM': 'Rangkasbitung',

  // Tangerang Line
  'TNG': 'Tangerang', 'BPR': 'Tangerang', 'PI': 'Tangerang', 'KJD': 'Tangerang', 'RWB': 'Tangerang', 'BOI': 'Tangerang', 'TKO': 'Tangerang', 'PSG': 'Tangerang', 'GF': 'Tangerang',

  // Tanjung Priok Line
  'TPK': 'TanjungPriok', 'AC': 'TanjungPriok',
};

export const getLineColor = (line: string) => {
  switch (line) {
    case 'Bogor': return '#ef4444';
    case 'Cikarang': return '#3b82f6';
    case 'Rangkasbitung': return '#10b981';
    case 'Tangerang': return '#8b5cf6';
    case 'TanjungPriok': return '#ec4899';
    default: return '#64748b';
  }
};
