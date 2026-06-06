import { Dashboard } from '../../src/components/Dashboard';
import { SetupScreen } from '../../src/components/SetupScreen';
import { useTransit } from '../../src/context/TransitContext';

export default function HomeScreen() {
  const { activeTrain } = useTransit();
  return activeTrain ? <Dashboard /> : <SetupScreen />;
}
