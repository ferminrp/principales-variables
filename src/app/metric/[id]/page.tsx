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
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { addDays, format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
    to: new Date(),
  })

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
  if (!metric) return (
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
            <BreadcrumbPage>
              <Skeleton className="h-4 w-[200px]" />
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card>
        <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
            <Skeleton className="h-6 w-[250px] mb-2" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
          <div className="flex">
            <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
              <Skeleton className="h-4 w-[60px] mb-2" />
              <Skeleton className="h-8 w-[100px]" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    </div>
  )

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

      <div className="mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "yyyy-MM-dd")} - {format(date.to, "yyyy-MM-dd")}
                  </>
                ) : (
                  format(date.from, "yyyy-MM-dd")
                )
              ) : (
                <span>Seleccionar rango de fechas</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      <ReservasChart
        variableId={metric.idVariable}
        title={metric.descripcion}
        label="Value"
        color="hsl(var(--chart-1))"
        chartType="line"
        startDate={date?.from}
        endDate={date?.to}
      />
    </div>
  )
}