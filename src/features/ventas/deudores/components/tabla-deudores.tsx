import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { EstadoProximoPago } from '@/features/ventas/deudores/components/estado-proximo-pago'
import type { FilaDeudor } from '@/features/ventas/deudores/types/cuenta-corriente'

/** Props de la tabla de deudores (desde xl). */
interface TablaDeudoresProps {
  filas: FilaDeudor[]
  onAbrirFicha: (idDeudor: number) => void
}

// Misma distribucion que la tabla del Historial: grilla con subgrid, cada columna mide lo que su contenido y el
// espacio sobrante se reparte en separaciones iguales.
const CLASE_FILA = 'col-span-full grid grid-cols-subgrid items-center border-b px-contorno'

/**
 * Tabla de deudores para pantallas anchas. Toda la fila abre la ficha: el nombre es el boton y se estira sobre
 * la fila entera, asi hay un solo punto de foco por deudor y un area de toque amplia.
 */
export function TablaDeudores({ filas, onAbrirFicha }: TablaDeudoresProps) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div
        role="table"
        aria-label="Deudores, por orden alfabético"
        className="grid grid-cols-[repeat(5,auto)] justify-between text-cuerpo"
      >
        {/* --- ENCABEZADO --- */}
        <div role="row" className={cn(CLASE_FILA, 'min-h-control font-medium text-texto-suave')}>
          <span role="columnheader">Nombre</span>
          <span role="columnheader">DNI</span>
          <span role="columnheader" className="justify-self-end">
            Fiados pendientes
          </span>
          <span role="columnheader" className="justify-self-end">
            Saldo
          </span>
          <span role="columnheader">Próximo pago</span>
        </div>

        {/* --- FILAS --- */}
        {filas.map((fila) => (
          <div
            key={fila.idDeudor}
            role="row"
            className={cn(
              CLASE_FILA,
              'relative min-h-16 py-interno transition-colors last:border-b-0 hover:bg-fondo-hover/60 has-[button:focus-visible]:bg-fondo-hover/60',
            )}
          >
            <div role="cell" className="min-w-0">
              <button
                type="button"
                aria-label={`Ver la ficha de ${fila.nombreCompleto}`}
                className="max-w-64 truncate text-left font-bold outline-none after:absolute after:inset-0 focus-visible:after:ring-[3px] focus-visible:after:ring-foco/50 focus-visible:after:ring-inset"
                onClick={() => onAbrirFicha(fila.idDeudor)}
              >
                {fila.nombreCompleto}
              </button>
            </div>
            <div role="cell" className="tabular-nums">
              {fila.dni}
            </div>
            <div role="cell" className="justify-self-end tabular-nums">
              {fila.cantidadFiadosPendientes}
            </div>
            <div
              role="cell"
              className={cn(
                'justify-self-end font-bold whitespace-nowrap tabular-nums',
                fila.saldo === 0 && 'font-normal text-texto-suave',
              )}
            >
              {formatearMoneda(fila.saldo)}
            </div>
            <div role="cell">
              <EstadoProximoPago
                fecha={fila.proximaFechaEstimadaPago}
                vencido={fila.proximoPagoVencido}
                tieneSaldo={fila.saldo > 0}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
