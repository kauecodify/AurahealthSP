import Dashboard from "@/components/Dashboard";
import { ROI_BASELINE_MINUTES_PER_SESSION } from "@/lib/mock-rnds-data";

export default function Home() {
  return <Dashboard baselineMinutes={ROI_BASELINE_MINUTES_PER_SESSION} />;
}
