'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ReservasChart } from "@/components/reservas-chart"
import { CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface Metric {
  idVariable: number
  descripcion: string
  valor: number
  fecha: string
}

export default function MetricPage() {
  const { id } = useParams()
  const [metric, setMetric] = useState<Metric | null>(null)

  useEffect(() => {
    const fetchMetric = async () => {
      try {
        const response = await fetch(`https://api.bcra.gob.ar/estadisticas/v2.0/PrincipalesVariables`)
        if (!response.ok) throw new Error('Failed to fetch data')
        const data = await response.json()
        const foundMetric = data.results.find((item: Metric) => item.idVariable === Number(id))
        if (foundMetric) setMetric(foundMetric)
      } catch (error) {
        console.error('Error fetching metric:', error)
      }
    }

    if (id) fetchMetric()
  }, [id])

  if (!metric) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-4">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>
              <Link href="/">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{metric.descripcion}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <CardTitle className="mb-6">{metric.descripcion}</CardTitle>

      <ReservasChart
        variableId={metric.idVariable}
        title={metric.descripcion}
        label="Value"
        color="hsl(var(--chart-1))"
        chartType="line"
      />
    </div>
  )
}