'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Wallet, DollarSignIcon, PercentIcon, BadgeDollarSign, Landmark, HandCoins, BarChart2 } from "lucide-react"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { chartPages } from "@/config/chartPages"

// Update the constant with integer IDs
const FEATURED_METRIC_IDS = [1, 4, 6, 14, 16, 17];

interface DataItem {
  idVariable: number;  // Changed from string to number
  descripcion: string;
  valor: number;
  fecha: string;
}

const formatNumber = (num: number) => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B'
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K'
  }
  return num.toFixed(2)
}

export function Dashboard() {
  const [data, setData] = useState<{ results: DataItem[] }>({ results: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('https://api.bcra.gob.ar/estadisticas/v2.0/PrincipalesVariables')
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const result = await response.json()
        setData(result)
        setError(null)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to fetch data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const getFeaturedMetrics = () => {
    return FEATURED_METRIC_IDS
      .map(idVariable => data.results.find(item => item.idVariable === idVariable))
      .filter(Boolean) as DataItem[];
  };

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const featuredMetrics = getFeaturedMetrics()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mt-8 mb-12">Dashboard Banco Central de la República Argentina</h1>
      {featuredMetrics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {featuredMetrics.map((item, index) => (
            <Card key={item.idVariable}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {item.descripcion.split('(')[0].trim()}
                </CardTitle>
                {index === 0 && <Landmark className="h-4 w-4 text-muted-foreground" />}
                {index === 1 && <BadgeDollarSign className="h-4 w-4 text-muted-foreground" />}
                {index === 2 && <PercentIcon className="h-4 w-4 text-muted-foreground" />}
                {index === 3 && <HandCoins className="h-4 w-4 text-muted-foreground" />}
                {index === 4 && <DollarSignIcon className="h-4 w-4 text-muted-foreground" />}
                {index === 5 && <Wallet className="h-4 w-4 text-muted-foreground" />}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(item.valor)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Actualizado: {new Date(item.fecha).toLocaleDateString()}
                </p>
                <Link href={`/${chartPages.find(page => page.variableId === item.idVariable)?.slug || ''}`} passHref>
                  <Button size="sm" variant="secondary" className="w-full mt-2">
                    <BarChart2 className="h-4 w-4 mr-2" />
                    Ver gráfico
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div>No featured metrics available</div>
      )}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Detailed Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.results.map((item: DataItem, index) => (
                <TableRow key={index}>
                  <TableCell>{item.descripcion}</TableCell>
                  <TableCell>{formatNumber(item.valor)}</TableCell>
                  <TableCell>{new Date(item.fecha).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}