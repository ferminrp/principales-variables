import { ReservasChart } from "@/components/reservas-chart";

export default function ReservasPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Reservas del BCRA</h1>
      <ReservasChart 
        variableId={1} 
        title="Reservas Internacionales (M)" 
        label="Reservas"
        color="hsl(var(--chart-1))"
        chartType="bar" // or "line"
      />
    </div>
  );
}