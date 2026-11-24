import { FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { formatearFecha } from '@/lib/formatear-fecha-hora'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { EstadoProximoPago } from '@/features/ventas/deudores/components/estado-proximo-pago'
import type { FilaDeudor } from '@/features/ventas/deudores/types/cuenta-corriente'

/** Props de la tabla de deudores (desde xl). */
interface TablaDeudoresProps {
  filas: FilaDeudor[]
  onAbrirFicha: (idDeudor: number) => void
}

// Misma distribucion que la tabla del Historial: grilla con subgrid, cada columna mide lo que su contenido y el
// espacio sobrante se reparte en separaciones iguales. pr-interno: el boton de icono ya trae su propio aire.
const CLASE_FILA = 'col-span-full grid grid-cols-subgrid items-center border-b pr-interno pl-contorno'

/** Tabla de deudores para pantallas anchas. Como en el Historial, la ficha se abre con el boton de la ultima columna. */
export function TablaDeudores({ filas, onAbrirFicha }: TablaDeudoresProps) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div
        role="table"
        aria-label="Deudores"
        className="grid grid-cols-[repeat(7,auto)] justify-between gap-x-interno text-cuerpo"
      >
        {/* --- ENCABEZADO --- */}
        <div role="row" className={cn(CLASE_FILA, 'min-h-control font-medium text-texto-suave')}>
          <span role="columnheader">Nombre</span>
          <span role="columnheader">DNI</span>
          <span role="columnheader">Fiados pendientes</span>
          <span role="columnheader" className="justify-self-end">
            Saldo
          </span>
          <span role="columnheader">Fecha de fiado</span>
          <span role="columnheader">Próximo pago</span>
          <span role="columnheader">
            <span className="sr-only">Acciones</span>
          </span>
        </div>

        {/* --- FILAS --- */}
        {filas.map((fila) => (
          <div
            key={fila.idDeudor}
            role="row"
            className={cn(CLASE_FILA, 'min-h-16 py-2 transition-colors last:border-b-0 hover:bg-fondo-hover/60')}
          >
            <div role="cell" className="max-w-44 min-w-0 truncate font-bold">
              {fila.nombreCompleto}
            </div>
            <div role="cell" className="tabular-nums">
              {fila.dni}
            </div>
            <div role="cell" className="tabular-nums">
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
            <div role="cell" className="whitespace-nowrap tabular-nums">
              {fila.fiadoDesde === null ? <span className="text-texto-suave">—</span> : formatearFecha(fila.fiadoDesde)}
            </div>
            <div role="cell">
              <EstadoProximoPago
                fecha={fila.proximaFechaEstimadaPago}
                vencido={fila.proximoPagoVencido}
                tieneSaldo={fila.saldo > 0}
              />
            </div>
            <div role="cell">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label={`Ver la ficha de ${fila.nombreCompleto}`}
                    className="size-control"
                    onClick={() => onAbrirFicha(fila.idDeudor)}
                  >
                    <FileText className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ver ficha</TooltipContent>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
