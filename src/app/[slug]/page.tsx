import { ReservasChart } from "@/components/reservas-chart";
import { chartPages } from "@/config/chartPages";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return chartPages.map((page) => ({
    slug: page.slug,
  }));
}

export default function DynamicChartPage({ params }: { params: { slug: string } }) {
  const pageConfig = chartPages.find((page) => page.slug === params.slug);

  if (!pageConfig) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{pageConfig.title}</h1>
      <ReservasChart 
        variableId={pageConfig.variableId}
        title={pageConfig.title}
        label={pageConfig.label}
        color="hsl(var(--chart-1))"
        chartType={pageConfig.chartType as "bar" | "line"}
      />
    </div>
  );
}