'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowDownIcon, ArrowUpIcon, DollarSignIcon, PercentIcon, TrendingUpIcon } from "lucide-react"
import { useState, useEffect } from 'react'

// Add this interface at the top of your file
interface DataItem {
  descripcion: string;
  valor: number;
  fecha: string;
}

// Helper function to format large numbers
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.bcra.gob.ar/estadisticas/v2.0/PrincipalesVariables')
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const result = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Argentine Central Bank Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.results.slice(0, 6).map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.descripcion.split('(')[0].trim()}
              </CardTitle>
              {index === 0 && <DollarSignIcon className="h-4 w-4 text-muted-foreground" />}
              {index === 1 && <ArrowUpIcon className="h-4 w-4 text-muted-foreground" />}
              {index === 2 && <PercentIcon className="h-4 w-4 text-muted-foreground" />}
              {index === 3 && <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />}
              {(index === 4 || index === 5) && <ArrowUpIcon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(item.valor)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Updated: {new Date(item.fecha).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
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