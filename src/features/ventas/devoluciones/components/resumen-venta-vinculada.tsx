import { Link2Off } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { VentaVinculada } from '@/features/ventas/devoluciones/types/devolucion'
import { describirOrigen } from '@/features/ventas/utils/describir-origen-entrega'
import { listarDatosEnvio } from '@/features/ventas/utils/listar-datos-envio'
import { formatearFechaHora } from '@/lib/formatear-fecha-hora'
import { formatearMoneda } from '@/lib/formatear-moneda'

/** Props del resumen de la venta vinculada. */
interface ResumenVentaVinculadaProps {
  venta: VentaVinculada
  onDesvincularVenta: () => void
  /** Texto del boton que quita el vinculo. */
  etiquetaQuitar: string
}

/** Comprobante, fecha, origen y total de la venta elegida, con la salida para quitar el vinculo. */
export function ResumenVentaVinculada({ venta, onDesvincularVenta, etiquetaQuitar }: ResumenVentaVinculadaProps) {
  // Solo con Envio y con valor: un dato null no deja una linea vacia
  const datosEnvio = listarDatosEnvio(venta.modalidadEntrega === 'ENVIO', venta.direccionEnvio, venta.destinatarioEnvio)

  return (
    <Card className="flex-col gap-interno p-contorno sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-auxiliar text-texto-suave">Venta vinculada</p>
        <p className="font-bold tabular-nums">{venta.numeroComprobante}</p>
        <p className="text-cuerpo text-texto-suave tabular-nums">
          {formatearFechaHora(venta.fechaHora)} · {describirOrigen(venta.origen)} · Total{' '}
          {formatearMoneda(venta.montoTotal)}
        </p>
        {datosEnvio.map((dato) => (
          <p key={dato.etiqueta} className="break-words text-cuerpo text-texto-suave">
            {dato.etiqueta}: {dato.valor}
          </p>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        className="shrink-0 gap-1.5 bg-fondo-tarjeta"
        onClick={onDesvincularVenta}
      >
        <Link2Off />
        {etiquetaQuitar}
      </Button>
    </Card>
  )
}
