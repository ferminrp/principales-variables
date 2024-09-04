import { ReservasChart } from "@/components/reservas-chart";

export default function TipoDeCambioMinoristaPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tipo de Cambio Minorista</h1>
      <ReservasChart 
        variableId={4} 
        title="Tipo de Cambio Minorista" 
        label="Tipo de Cambio"
        color="hsl(var(--chart-1))"
        chartType="line" // or "bar"
      />
    </div>
  );
}