'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, LineChart, Line, XAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Skeleton } from "@/components/ui/skeleton"

interface ApiResponse {
  status: number;
  results: {
    idVariable: number;
    fecha: string;
    valor: number;
  }[];
}

interface ReservaData {
  d: string;
  v: number;
}

interface ReservasChartProps {
  variableId: number;
  title: string;
  label: string;
  color: string;
  chartType: 'bar' | 'line';
  startDate?: Date;
  endDate?: Date;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

const formatValue = (value: number) => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + ' M';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(2) + ' K';
  } else {
    return value.toFixed(2);
  }
}

export function ReservasChart({ variableId, title, label, color, chartType, startDate, endDate }: ReservasChartProps) {
  const [data, setData] = useState<ReservaData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`https://api.bcra.gob.ar/estadisticas/v3.0/Monetarias/${variableId}`)
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const result: ApiResponse = await response.json()
        let formattedData: ReservaData[] = result.results
          .map(item => ({
            d: item.fecha,
            v: item.valor
          }))
          .sort((a, b) => new Date(a.d).getTime() - new Date(b.d).getTime())

        // Filter data by date range if provided
        if (startDate || endDate) {
          formattedData = formattedData.filter(item => {
            const itemDate = new Date(item.d)
            if (startDate && endDate) {
              return itemDate >= startDate && itemDate <= endDate
            } else if (startDate) {
              return itemDate >= startDate
            } else if (endDate) {
              return itemDate <= endDate
            }
            return true
          })
        }
        
        setData(formattedData)
        setError(null)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError(`Failed to fetch data: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [variableId, startDate, endDate])

  const latestValue = useMemo(() => data.length > 0 ? data[data.length - 1].v : 0, [data]);

  if (isLoading) return (
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
  )
  if (error) return <div>Error: {error}</div>
  if (data.length === 0) return <div>No hay datos disponibles</div>

  const chartConfig = {
    data: {
      label: label,
      color: color,
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Toda la información histórica disponible
          </CardDescription>
        </div>
        <div className="flex">
          <div className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">
              {chartConfig.data.label}
            </span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {formatValue(latestValue)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart
                data={data}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="d"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={formatDate}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[150px]"
                      nameKey="data"
                      labelFormatter={(value) => formatDate(value)}
                      formatter={(value) => formatValue(value as number)}
                    />
                  }
                />
                <Bar
                  dataKey="v"
                  fill={chartConfig.data.color}
                />
              </BarChart>
            ) : (
              <LineChart
                data={data}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="d"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={formatDate}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="w-[150px]"
                      nameKey="data"
                      labelFormatter={(value) => formatDate(value)}
                      formatter={(value) => formatValue(value as number)}
                    />
                  }
                />
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={chartConfig.data.color}
                  dot={false}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}