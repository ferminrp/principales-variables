'use client'

import { useState } from 'react'
import { sendGAEvent } from '@next/third-parties/google'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { AlertCircle } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import entityLogos from '@/data/entityLogos.json'

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
  const [errorActual, setErrorActual] = useState<string | null>(null)
  const [errorHistorica, setErrorHistorica] = useState<string | null>(null)

  const consultarDeuda = async () => {
    setErrorActual(null)
    setErrorHistorica(null)
    setDeudaActual(null)
    setDeudaHistorica(null)

    // Send GA event when the user clicks the "Consultar" button
    sendGAEvent('search', {
      search_term: cuit,
      category: 'deuda_bcra'
    })

    try {
      const responseActual = await fetch(`https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas/${cuit}`)
      const dataActual = await responseActual.json()
      
      if (responseActual.status !== 200) {
        throw new Error(dataActual.message || 'Error al consultar la deuda actual')
      }
      
      setDeudaActual(dataActual)
    } catch (error) {
      console.error('Error al consultar la deuda actual:', error)
      setErrorActual(error instanceof Error ? error.message : 'Error desconocido al consultar la deuda actual')
    }

    try {
      const responseHistorica = await fetch(`https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas/Historicas/${cuit}`)
      const dataHistorica = await responseHistorica.json()
      
      if (responseHistorica.status !== 200) {
        throw new Error(dataHistorica.message || 'Error al consultar la deuda histórica')
      }
      
      setDeudaHistorica(dataHistorica)
    } catch (error) {
      console.error('Error al consultar la deuda histórica:', error)
      setErrorHistorica(error instanceof Error ? error.message : 'Error desconocido al consultar la deuda histórica')
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

  const getEntityLogo = (entityName: string) => {
    return entityLogos[entityName as keyof typeof entityLogos] || null
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

      {errorActual && (
        <Card className="mb-8 bg-red-50 border-red-200">
          <CardContent className="flex items-center gap-4 pt-6">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <p className="text-red-700">{errorActual}</p>
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
                    {getEntityLogo(entidad.entidad) ? (
                      <img src={getEntityLogo(entidad.entidad)} alt={entidad.entidad} className="w-full h-full object-cover" />
                    ) : (
                      <AvatarFallback className="rounded-full" style={{ borderRadius: '50%' }}>
                        {getInitials(entidad.entidad)}
                      </AvatarFallback>
                    )}
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

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Preguntas Frecuentes</h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>¿Qué significa cada situación en la Central de Deudores?</AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2">Considerando solo la mora:</p>
                  <ul className="list-disc pl-5">
                    <li><strong>1. Normal:</strong> Atraso en el pago que no supere los 31 días. (*)</li>
                    <li><strong>2. Riesgo bajo:</strong> Atraso en el pago de más de 31 y hasta 90 días desde el vencimiento. (*)</li>
                    <li><strong>3. Riesgo medio:</strong> Atraso en el pago de más de 90 y hasta 180 días. (*)</li>
                    <li><strong>4. Riesgo alto:</strong> Atraso en el pago de más de 180 días hasta un año. (*)</li>
                    <li><strong>5. Irrecuperable:</strong> Atrasos superiores a un año</li>
                  </ul>
                  <p className="mt-2 text-sm italic">(*) A partir de la fecha de vencimiento de la obligación más antigua.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>¿De dónde sale esta información?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    Es información pública provista por el Banco Central en la Central de Deudores. 
                    Puedes acceder a ella directamente en el sitio web del BCRA: 
                    <a 
                      href="https://www.bcra.gob.ar/BCRAyVos/Situacion_Crediticia.asp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline ml-1"
                    >
                      Central de Deudores del BCRA
                    </a>.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      )}

      {errorHistorica && (
        <Card className="mb-8 bg-red-50 border-red-200">
          <CardContent className="flex items-center gap-4 pt-6">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <p className="text-red-700">{errorHistorica}</p>
          </CardContent>
        </Card>
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