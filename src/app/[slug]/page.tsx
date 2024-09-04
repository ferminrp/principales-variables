import { ReservasChart } from "@/components/reservas-chart";
import { chartPages } from "@/config/chartPages";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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

  const pageTitle = pageConfig.pageTitle || pageConfig.chartTitle || "";

  return (
    <div className="container mx-auto p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <h1 className="text-2xl font-bold mb-4">{pageTitle}</h1>
      <ReservasChart 
        variableId={pageConfig.variableId}
        title={pageConfig.chartTitle || pageConfig.pageTitle || ""}
        label={pageConfig.label || ""}
        color="hsl(var(--chart-1))"
        chartType={pageConfig.chartType as "bar" | "line"}
      />
    </div>
  );
}