'use client'

import { useState } from 'react'
import { sendGAEvent } from '@next/third-parties/google'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { AlertCircle } from 'lucide-react'

type Entidad = {
  entidad: string
  situacion: number
  monto: number
}

type Periodo = {
  periodo: string
  entidades: Entidad[]
}

type DeudaResponse = {
  status: number
  results: {
    identificacion: number
    denominacion: string
    periodos: Periodo[]
  }
}

type DeudaHistoricaResponse = {
  status: number
  results: {
    identificacion: number
    denominacion: string
    periodos: Periodo[]
  }
}

export function DeudasBcra() {
  const [cuit, setCuit] = useState('')
  const [deudaActual, setDeudaActual] = useState<DeudaResponse | null>(null)
  const [deudaHistorica, setDeudaHistorica] = useState<DeudaHistoricaResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const consultarDeuda = async () => {
    try {
      setError(null) // Clear any previous errors
      // Send GA event when the user clicks the "Consultar" button
      sendGAEvent('search', {
        search_term: cuit,
        category: 'deuda_bcra'
      })

      const responseActual = await fetch(`https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas/${cuit}`)
      const dataActual = await responseActual.json()
      
      if (responseActual.status !== 200) {
        throw new Error(dataActual.message || 'Error al consultar la deuda actual')
      }
      
      setDeudaActual(dataActual)

      const responseHistorica = await fetch(`https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas/Historicas/${cuit}`)
      const dataHistorica = await responseHistorica.json()
      
      if (responseHistorica.status !== 200) {
        throw new Error(dataHistorica.message || 'Error al consultar la deuda histórica')
      }
      
      setDeudaHistorica(dataHistorica)
    } catch (error) {
      console.error('Error al consultar la deuda:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido al consultar la deuda')
      setDeudaActual(null)
      setDeudaHistorica(null)
    }
  }

  const handleCuitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCuit = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
    setCuit(newCuit);

    // Send GA event when the CUIT input changes
    sendGAEvent('input', {
      input_value: newCuit,
      category: 'deuda_bcra_input'
    });
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const prepareChartData = () => {
    if (!deudaHistorica) return []

    return deudaHistorica.results.periodos.map(periodo => ({
      name: periodo.periodo,
      total: periodo.entidades.reduce((sum, entidad) => sum + entidad.monto * 1000, 0)
    })).reverse() // Eliminamos .slice(0, 12) para mostrar todos los meses
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value)
  }

  const formatPeriod = (period: string) => {
    const year = period.substring(0, 4)
    const month = period.substring(4)
    return `${month}/${year}`
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Consulta de Deudas BCRA</h1>
      <div className="flex gap-4 mb-8">
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={cuit}
          onChange={handleCuitChange}
          placeholder="Ingrese CUIT (solo números)"
          className="max-w-xs"
        />
        <Button onClick={consultarDeuda}>Consultar</Button>
      </div>

      {error && (
        <Card className="mb-8 bg-red-50 border-red-200">
          <CardContent className="flex items-center gap-4 pt-6">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {deudaActual && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Deuda Actual</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deudaActual.results.periodos[0].entidades.map((entidad, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-4">
                  <Avatar className="rounded-full overflow-hidden" style={{ borderRadius: '50%' }}>
                    <AvatarFallback className="rounded-full" style={{ borderRadius: '50%' }}>
                      {getInitials(entidad.entidad)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-sm leading-tight">
                    {entidad.entidad}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Situación: {entidad.situacion}</p>
                  <p>Monto: {formatCurrency(entidad.monto * 1000)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {deudaHistorica && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Evolución Histórica de la Deuda</h2>
          <Card>
            <CardContent className="h-[600px]"> {/* Aumentamos la altura del gráfico */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={prepareChartData()}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 60,
                    bottom: 80, // Aumentamos el margen inferior
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-90} // Rotamos las etiquetas 90 grados
                    textAnchor="end" 
                    height={80} // Aumentamos la altura del eje X
                    interval={0} // Mostramos todas las etiquetas
                    tickFormatter={formatPeriod}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                    width={100}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)}
                    labelFormatter={formatPeriod}
                  />
                  <Legend />
                  <Bar dataKey="total" fill="#8884d8" name="Deuda Total" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mt-8">
        <CardFooter className="text-sm text-gray-600">
          <p className="text-justify pt-4">
            Esta página utiliza las APIs e información pública del Banco Central 
            (<a href="https://www.bcra.gob.ar/Catalogo/apis.asp?fileName=central-deudores-v1&sectionName=Central%20de%20Deudores" 
                className="text-green-600 hover:text-green-800 underline" 
                target="_blank" 
                rel="noopener noreferrer">
              Link
            </a>) para que cualquiera pueda consultar esa información de manera amigable. 
            No recolectamos ni guardamos información sobre deuda ni consultas. 
            Cualquiera reclamo sobre la información aquí presentada deberá ser hecho con las entidades que figuran.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}