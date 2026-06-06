import { useEffect } from 'react';
import { Vibration } from 'react-native';
import { useTransit } from '../context/TransitContext';

export const useVibration = () => {
  const { isWarMode } = useTransit();

  useEffect(() => {
    if (isWarMode) {
      Vibration.vibrate([0, 500, 200, 500], true);
    } else {
      Vibration.cancel();
    }

    return () => Vibration.cancel();
  }, [isWarMode]);
};
