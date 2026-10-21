import { AddFlightForm } from "@/components/AddFlightForm";
import { ImportPanel } from "@/components/ImportPanel";

export default function AddPage() {
  return (
    <div className="space-y-5 px-4 pb-8 pt-4">
      <h1 className="display text-[28px] tracking-[-0.4px]">Search</h1>
      <p className="text-[15px] text-[var(--text-2)]">
        Add by flight number or route.
      </p>
      <AddFlightForm />
      <ImportPanel />
    </div>
  );
}
