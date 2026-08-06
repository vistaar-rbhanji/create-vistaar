import { SetupWizard } from "../components/setup";
import type { SetupStatus } from "../types/app";

interface SetupWizardPageProps {
  status: SetupStatus | null;
  error: string | null;
  onRefresh: () => void;
}

export function SetupWizardPage({ status, error, onRefresh }: SetupWizardPageProps) {
  return <SetupWizard status={status} error={error} onRefresh={onRefresh} />;
}
