import { create } from 'axios';

/**
 * KCI API Service
 * Integrated based on docs/API.md requirements.
 * Includes browser-replication headers and session warmup for reliability.
 */

const api = create({
  baseURL: 'https://kci.id/api/krl',
  withCredentials: true,
  headers: {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Connection': 'keep-alive',
    'Referer': 'https://kci.id/perjalanan-krl/jadwal-kereta',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
    'X-Requested-With': 'XMLHttpRequest',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
  },
});

/**
 * 0. Session Warmup
 * API KCI (Laravel) often requires a valid session cookie (laravel_session).
 * Calling the main page helps establish this session.
 */
export const warmupSession = async () => {
  try {
    await api.get('https://kci.id/perjalanan-krl/jadwal-kereta', {
      baseURL: '', // Override baseURL to hit the main website
    });
    console.log('[Session] Warmup successful');
  } catch {
    console.warn('[Session] Warmup failed, cookies might still be active');
  }
};

/**
 * 1. Get Data Stations
 * URL: https://kci.id/api/krl/stations
 */
export const fetchStations = async () => {
  try {
    const { data } = await api.get('/stations');
    // Filter stations based on docs/API.md: only those with fg_enable: 1
    if (data.status === 200 && Array.isArray(data.data)) {
      return data.data.filter((s: any) => s.fg_enable === 1);
    }
    return [];
  } catch (error: any) {
    console.error("API Error (stations):", error.response?.data || error.message);
    return [];
  }
};

/**
 * 2. Get Data Schedules
 * URL: https://kci.id/api/krl/schedules?stationid={STA_ID}&timefrom={HH:MM}&timeto={HH:MM}
 */
export const fetchStationSchedule = async (stationId: string, timeFrom: string, timeTo: string) => {
  try {
    // API KCI is highly sensitive to format. Ensure HH:mm (no seconds).
    const tFrom = timeFrom.split(':').slice(0, 2).join(':');
    const tTo = timeTo.split(':').slice(0, 2).join(':');

    const params = { 
      stationid: stationId, 
      timefrom: tFrom, 
      timeto: tTo 
    };

    const headers = { 
      'Referer': `https://kci.id/perjalanan-krl/jadwal-kereta?staValue=${stationId}&fromTime=${tFrom.replace(':', '%3A')}&toTime=${tTo.replace(':', '%3A')}` 
    };

    console.log(`[API] Fetching schedules for ${stationId} (${tFrom} - ${tTo})`);
    
    let response = await api.get('/schedules', { params, headers });

    // Handle 404/Data not found with warmup and retry
    if (response.data?.status === 404 || response.data?.data === "Data not found") {
      console.warn(`[API] Data not found for ${stationId}. Retrying with session warmup...`);
      await warmupSession();
      await new Promise(resolve => setTimeout(resolve, 800)); // Brief delay for cookie registration
      response = await api.get('/schedules', { params, headers });
    }

    if (response.data?.status === 200) {
      return response.data.data || [];
    }
    return [];
  } catch (error: any) {
    console.error("API Error (schedules):", error.response?.data || error.message);
    return [];
  }
};

/**
 * 3. Get Data Details Trains
 * URL: https://kci.id/api/krl/train-schedule?trainid={TRAIN_ID}
 */
export const fetchTrainSchedule = async (trainId: string) => {
  try {
    const { data } = await api.get('/train-schedule', {
      params: { trainid: trainId }
    });
    
    if (data.status === 200) {
      return data.data || [];
    }
    return [];
  } catch (error: any) {
    console.error("API Error (train-schedule):", error.response?.data || error.message);
    return [];
  }
};
