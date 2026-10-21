import { AddFlightForm } from "@/components/AddFlightForm";
import { ImportPanel } from "@/components/ImportPanel";

export default function AddPage() {
  return (
    <div className="space-y-6 px-4 pb-8 pt-4">
      <h1 className="display text-[28px]">Search</h1>
      <p className="text-[15px] text-[var(--text-2)]">
        Add a flight by number or import from calendar / CSV. Pro enrichment is always on.
      </p>
      <AddFlightForm />
      <ImportPanel />
    </div>
  );
}
