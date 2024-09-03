import { ReservasChart } from "@/components/reservas-chart";

export default function ReservasPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reservas del BCRA</h1>
      <ReservasChart />
    </div>
  );
}