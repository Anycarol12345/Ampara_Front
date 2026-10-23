import { DesignPreview } from './DesignPreview';
import { AppProviders } from './providers/AppProviders';

export function App() {
  return (
    <AppProviders>
      <DesignPreview />
    </AppProviders>
  );
}
