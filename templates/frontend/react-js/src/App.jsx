import { useSetupStatus } from "./hooks/useSetupStatus";
import { SetupWizardPage } from "./pages/SetupWizardPage";
import { WelcomePage } from "./pages/WelcomePage";

export default function App() {
  const { status, loading, error, refetch } = useSetupStatus();

  if (loading && !status) {
    return <div className="app-boot">Checking setup…</div>;
  }

  if (error || !status || !status.setupComplete) {
    return <SetupWizardPage status={status} error={error} onRefresh={refetch} />;
  }

  return <WelcomePage />;
}
