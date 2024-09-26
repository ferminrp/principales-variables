import { Metadata } from 'next'
import { DeudasBcra } from "@/components/deudas-bcra"

export const metadata: Metadata = {
  title: "Consulta Gratuita de Deuda | BCRA",
  description: "Consulta la situación crediticia de personas y empresas en la Central de Deudores del Banco Central de la República Argentina (BCRA)",
  openGraph: {
    title: "Consulta de Deudores BCRA",
    description: "Verifica la situación crediticia en la Central de Deudores del BCRA",
    type: "website",
    url: "https://bcra.ferminrp.com/deudores",
    images: [{ url: "/meta-img.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Consulta de Deudores BCRA",
    description: "Verifica la situación crediticia en la Central de Deudores del BCRA",
    images: ["/meta-img.png"],
  },
}

export default function DeudoresPage() {
  return <DeudasBcra />
}