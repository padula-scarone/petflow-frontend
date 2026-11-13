import { useEffect, useRef } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { ErrorAccionCambio } from '@/features/ventas/cambios-mercaderia/types/cambio'

const TITULO_POR_CODIGO: Record<ErrorAccionCambio['codigo'], string> = {
  DATOS_INVALIDOS: 'El servidor rechazó el cambio',
  SALDO_NEGATIVO: 'El saldo no puede ser negativo',
  PLAZO_VENCIDO: 'Se venció el plazo',
  VENTA_NO_ENCONTRADA: 'No se encontró la venta',
  CAMBIO_NO_ENCONTRADO: 'El cambio ya no existe',
  SIN_CAJA_ABIERTA: 'No hay caja abierta',
  STOCK_INSUFICIENTE: 'Se agotó el stock',
  VENTA_NO_VINCULABLE: 'La venta no se puede vincular',
  CANTIDAD_EXCEDE_VENTA: 'La cantidad supera lo vendido',
  CAMBIO_YA_ANULADO: 'El cambio ya estaba anulado',
  STOCK_INSUFICIENTE_PARA_REVERTIR: 'No se puede revertir el stock',
}

/** Props del aviso de rechazo del servidor al confirmar un cambio. */
interface AlertaErrorCambioProps {
  error: ErrorAccionCambio
  onElegirOtraVenta: () => void
  onReintentar: () => void
}

/**
 * Rechazo del servidor al confirmar. Dice que paso y que se puede hacer: sin caja abierta se reintenta
 * despues de abrirla; con la venta inexistente se elige otra; con stock o datos se vuelve a corregir.
 */
export function AlertaErrorCambio({ error, onElegirOtraVenta, onReintentar }: AlertaErrorCambioProps) {
  const referencia = useRef<HTMLDivElement>(null)

  // El aviso aparece arriba del cuerpo y el boton de confirmar esta abajo: se lo trae a la vista
  useEffect(() => {
    referencia.current?.scrollIntoView({ block: 'nearest' })
  }, [error])

  return (
    <div ref={referencia}>
      <Alert variant="destructive">
        <TriangleAlert aria-hidden="true" />
        <AlertTitle>{TITULO_POR_CODIGO[error.codigo]}</AlertTitle>
        <AlertDescription>
          <p>{error.mensaje}</p>
          {error.codigo === 'VENTA_NO_ENCONTRADA' && (
            <Button
              type="button"
              variant="outline"
              className="mt-2 h-11 bg-fondo-tarjeta px-6 text-texto-principal"
              onClick={onElegirOtraVenta}
            >
              Elegir otra venta
            </Button>
          )}
          {error.codigo === 'SIN_CAJA_ABIERTA' && (
            <Button
              type="button"
              variant="outline"
              className="mt-2 h-11 bg-fondo-tarjeta px-6 text-texto-principal"
              onClick={onReintentar}
            >
              Reintentar
            </Button>
          )}
          {error.codigo !== 'VENTA_NO_ENCONTRADA' && error.codigo !== 'SIN_CAJA_ABIERTA' && (
            <p className="text-xs">Volvé al paso anterior para corregirlo.</p>
          )}
        </AlertDescription>
      </Alert>
    </div>
  )
}
