import { Dashboard } from "@/components/dashboard";
import { chartPages } from "@/config/chartPages";
import { Suspense } from "react";
import Link from "next/link";

// Prefetch component that creates links with prefetch enabled
function PrefetchLinks() {
  return (
    <div className="hidden">
      {chartPages.map((page) => (
        <Link 
          key={page.variableId} 
          href={`/metric/${page.variableId}`} 
          prefetch={true}
        />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Dashboard />
      <Suspense fallback={null}>
        <PrefetchLinks />
      </Suspense>
    </>
  );
}
