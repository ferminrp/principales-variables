'use client'

import { useState, useEffect } from 'react'
import { Bar, BarChart, Label, Rectangle, ReferenceLine, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface MetricDrawerProps {
  isOpen: boolean
  onClose: () => void
  metric: {
    idVariable: number
    descripcion: string
    valor: number
    fecha: string
  }
}

interface ChartData {
  date: string
  value: number
}

export function MetricDrawer({ isOpen, onClose, metric }: MetricDrawerProps) {
  const [data, setData] = useState<ChartData[]>([])

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return

      const endDate = new Date()
      const startDate = new Date(endDate)
      startDate.setDate(startDate.getDate() - 30)
      
      const startDateString = startDate.toISOString().split('T')[0]
      const endDateString = endDate.toISOString().split('T')[0]
      
      try {
        const response = await fetch(`https://api.bcra.gob.ar/estadisticas/v2.0/DatosVariable/${metric.idVariable}/${startDateString}/${endDateString}`)
        if (!response.ok) throw new Error('Network response was not ok')
        const result = await response.json()
        const formattedData: ChartData[] = result.results
          .map((item: any) => ({
            date: item.fecha,
            value: item.valor
          }))
          .sort((a: ChartData, b: ChartData) => new Date(a.date).getTime() - new Date(b.date).getTime())
        setData(formattedData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [isOpen, metric.idVariable])

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
    return num.toFixed(2)
  }

  const average = data.length > 0 ? data.reduce((sum, item) => sum + item.value, 0) / data.length : 0

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{metric.descripcion}</SheetTitle>
          <SheetDescription>Últimos 30 días</SheetDescription>
        </SheetHeader>
        <Card className="mt-6">
          <CardHeader className="space-y-0 pb-2">
            <CardDescription>Último valor</CardDescription>
            <CardTitle className="text-4xl tabular-nums">
              {formatNumber(metric.valor)}{" "}
              <span className="font-sans text-sm font-normal tracking-normal text-muted-foreground">
                {metric.fecha}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                metric: {
                  label: metric.descripcion,
                  color: "hsl(var(--chart-1))",
                },
              }}
            >
              <BarChart
                width={300}
                height={200}
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <Bar
                  dataKey="value"
                  fill="var(--color-metric)"
                  radius={5}
                  fillOpacity={0.6}
                  activeBar={<Rectangle fillOpacity={0.8} />}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  tickFormatter={(value) => new Date(value).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideIndicator
                      labelFormatter={(value) => new Date(value).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                      formatter={(value) => formatNumber(value as number)}
                    />
                  }
                  cursor={false}
                />
                <ReferenceLine
                  y={average}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                >
                  <Label
                    position="insideBottomLeft"
                    value="Promedio"
                    offset={10}
                    fill="hsl(var(--foreground))"
                  />
                  <Label
                    position="insideTopLeft"
                    value={formatNumber(average)}
                    className="text-lg"
                    fill="hsl(var(--foreground))"
                    offset={10}
                    startOffset={100}
                  />
                </ReferenceLine>
              </BarChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-1">
            <CardDescription>
              Promedio de los últimos 30 días: <span className="font-medium text-foreground">{formatNumber(average)}</span>
            </CardDescription>
          </CardFooter>
        </Card>
      </SheetContent>
    </Sheet>
  )
}