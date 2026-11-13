import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import type { AltaCambioProps } from '@/features/ventas/cambios-mercaderia/types/cambio'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { cn } from '@/lib/utils'

/** Props del pie del alta. */
type PieAltaCambioProps = Pick<
  AltaCambioProps,
  'paso' | 'borrador' | 'resumenSaldo' | 'validacion' | 'estadoEnvio' | 'acciones'
>

/**
 * Pie fijo del modal: el saldo en vivo, el motivo por el que el boton esta bloqueado y los botones del paso.
 * Mobile: saldo arriba y botones debajo. Desde sm: saldo a la izquierda y botones a la derecha.
 */
export function PieAltaCambio({ paso, borrador, resumenSaldo, validacion, estadoEnvio, acciones }: PieAltaCambioProps) {
  const enviando = estadoEnvio.tipo === 'enviando'
  const esUltimoPaso = paso === 'COBRO'
  // puedeAvanzar[paso]: el paso actual esta completo. En el ultimo, eso es poder confirmar
  const puedeContinuar = validacion.puedeAvanzar[paso]
  const hayMotivoDeBloqueo = !enviando && !puedeContinuar && validacion.motivoNoAvanzar !== null
  const mostrarSaldo = (paso === 'ARTICULOS' || paso === 'COBRO') && resumenSaldo.situacion !== 'INCOMPLETO'

  const etiquetaPrincipal = esUltimoPaso
    ? enviando
      ? 'Registrando…'
      : 'Confirmar cambio'
    : paso === 'VENTA_ORIGINAL' && borrador.ventaVinculada === null
      ? 'Continuar sin vincular'
      : // No "Siguiente": se confundiria con el de la paginacion de los resultados de venta
        'Continuar'

  return (
    <DialogFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        {mostrarSaldo && (
          <p className="flex items-baseline gap-2 text-sm">
            <span className="text-texto-suave">Saldo</span>
            <span
              className={cn(
                'text-lg font-bold tabular-nums',
                resumenSaldo.situacion === 'NEGATIVO' && 'text-peligro',
              )}
            >
              {resumenSaldo.situacion === 'NEGATIVO' ? '− ' : ''}
              {formatearMoneda(Math.abs(resumenSaldo.saldo))}
            </span>
          </p>
        )}
        {/* Por que el boton esta deshabilitado */}
        {hayMotivoDeBloqueo && (
          <p role="status" className="text-xs text-texto-suave">
            {validacion.motivoNoAvanzar}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        {paso !== 'MOTIVO' && (
          <Button
            type="button"
            variant="outline"
            className="h-11 bg-fondo-tarjeta px-6"
            disabled={enviando}
            onClick={acciones.onPasoAnterior}
          >
            Volver
          </Button>
        )}
        <Button
          type="button"
          className="h-11 flex-1 px-6 sm:flex-none"
          disabled={!puedeContinuar || enviando}
          onClick={esUltimoPaso ? acciones.onConfirmarCambio : acciones.onSiguientePaso}
        >
          {etiquetaPrincipal}
        </Button>
      </div>
    </DialogFooter>
  )
}
