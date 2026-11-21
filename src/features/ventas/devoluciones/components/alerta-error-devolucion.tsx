import { useEffect, useRef } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { CodigoErrorDevolucion } from '@/features/ventas/devoluciones/types/api-devoluciones'
import type { ErrorAccionDevolucion } from '@/features/ventas/devoluciones/types/devolucion'

const TITULO_POR_CODIGO: Record<CodigoErrorDevolucion, string> = {
  DATOS_INVALIDOS: 'El servidor rechazó la devolución',
  SALDO_NEGATIVO: 'El saldo no puede ser negativo',
  PLAZO_VENCIDO: 'Se venció el plazo',
  VENTA_NO_ENCONTRADA: 'No se encontró la venta',
  CAMBIO_NO_ENCONTRADO: 'La devolución ya no existe',
  SIN_CAJA_ABIERTA: 'No hay caja abierta',
  STOCK_INSUFICIENTE: 'Se agotó el stock',
  VENTA_NO_VINCULABLE: 'La venta no se puede vincular',
  CANTIDAD_EXCEDE_VENTA: 'La cantidad supera lo vendido',
  CAMBIO_YA_ANULADO: 'La devolución ya estaba anulada',
  STOCK_INSUFICIENTE_PARA_REVERTIR: 'No se puede revertir el stock',
}

/** Titulo cuando el back no informa el caso (permiso, sin respuesta o una devolución que no se guardo). */
const TITULO_SIN_CODIGO = 'No se pudo registrar la devolución'

/** Props del aviso de rechazo del servidor al confirmar una devolución. */
interface AlertaErrorDevolucionProps {
  error: ErrorAccionDevolucion
  onElegirOtraVenta: () => void
  onReintentar: () => void
}

/**
 * Rechazo del servidor al confirmar. Dice que paso y que se puede hacer: sin caja abierta se reintenta
 * despues de abrirla; con la venta inexistente se elige otra; con stock o datos se vuelve a corregir.
 */
export function AlertaErrorDevolucion({ error, onElegirOtraVenta, onReintentar }: AlertaErrorDevolucionProps) {
  const referencia = useRef<HTMLDivElement>(null)

  // El aviso aparece arriba del cuerpo y el boton de confirmar esta abajo: se lo trae a la vista
  useEffect(() => {
    referencia.current?.scrollIntoView({ block: 'nearest' })
  }, [error])

  return (
    <div ref={referencia}>
      <Alert variant="destructive">
        <TriangleAlert aria-hidden="true" />
        <AlertTitle>{error.codigo === null ? TITULO_SIN_CODIGO : TITULO_POR_CODIGO[error.codigo]}</AlertTitle>
        <AlertDescription>
          <p>{error.mensaje}</p>
          {(error.codigo === 'VENTA_NO_ENCONTRADA' || error.codigo === 'VENTA_NO_VINCULABLE') && (
            <Button
              type="button"
              variant="outline"
              className="mt-2 bg-fondo-tarjeta text-texto-principal"
              onClick={onElegirOtraVenta}
            >
              Elegir otra venta
            </Button>
          )}
          {error.codigo === 'SIN_CAJA_ABIERTA' && (
            <Button
              type="button"
              variant="outline"
              className="mt-2 bg-fondo-tarjeta text-texto-principal"
              onClick={onReintentar}
            >
              Reintentar
            </Button>
          )}
          {error.codigo !== null &&
            error.codigo !== 'VENTA_NO_ENCONTRADA' &&
            error.codigo !== 'VENTA_NO_VINCULABLE' &&
            error.codigo !== 'SIN_CAJA_ABIERTA' && <p className="text-auxiliar">Volvé al paso anterior para corregirlo.</p>}
        </AlertDescription>
      </Alert>
    </div>
  )
}
