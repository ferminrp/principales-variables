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

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export default function MetricPage() {
  const { id } = useParams()
  const [metric, setMetric] = useState<Metric | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetric = async () => {
      try {
        // First get the variable description from the main endpoint
        const mainResponse = await fetch('https://api.bcra.gob.ar/estadisticas/v3.0/Monetarias')
        if (!mainResponse.ok) throw new Error('Failed to fetch variable data')
        const mainData = await mainResponse.json()
        const variableInfo = mainData.results.find((item: any) => item.idVariable === Number(id))
        
        if (!variableInfo) {
          throw new Error('Variable not found')
        }

        // Then get the historical data
        const response = await fetch(`https://api.bcra.gob.ar/estadisticas/v3.0/Monetarias/${id}`)
        if (!response.ok) throw new Error('Failed to fetch data')
        const data = await response.json()
        
        if (data.results && data.results.length > 0) {
          const latestResult = data.results[data.results.length - 1]
          setMetric({
            idVariable: Number(id),
            descripcion: variableInfo.descripcion,
            valor: latestResult.valor,
            fecha: latestResult.fecha
          })
        }
        setError(null)
      } catch (error) {
        console.error('Error fetching metric:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      }
    }

    if (id) fetchMetric()
  }, [id])

  if (error) return <div>Error: {error}</div>
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
            <BreadcrumbPage title={metric.descripcion}>{truncateText(metric.descripcion, 40)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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