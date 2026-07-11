import { ServiceUnavailablePage } from "@/components/deployment/service-unavailable-screen";
import { getMaintenanceScreenProps } from "@/lib/deployment/guards";

export const metadata = {
  title: "Maintenance",
  description: "CoachOS is undergoing scheduled maintenance.",
};

export default function MaintenancePage() {
  const props = getMaintenanceScreenProps();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 px-4">
      <ServiceUnavailablePage {...props} />
    </div>
  );
}
