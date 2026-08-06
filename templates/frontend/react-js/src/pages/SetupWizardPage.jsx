import { SetupWizard } from "../components/setup";

export function SetupWizardPage({ status, error, onRefresh }) {
  return <SetupWizard status={status} error={error} onRefresh={onRefresh} />;
}
