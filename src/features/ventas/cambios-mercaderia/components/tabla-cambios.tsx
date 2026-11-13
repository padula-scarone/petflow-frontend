import { Card } from '@/components/ui/card'
import {
  AccionesCambio,
  ArticuloDevueltoFila,
  ArticuloEntregadoFila,
  AvisoVentanaCambio,
  InsigniaEstadoCambio,
  TextoVentaVinculada,
} from '@/features/ventas/cambios-mercaderia/components/piezas-fila-cambio'
import { SaldoCambio } from '@/features/ventas/cambios-mercaderia/components/saldo-cambio'
import type { FilaCambio, PropiedadesAccionesCambio } from '@/features/ventas/cambios-mercaderia/types/cambio'
import { formatearFecha, formatearHora } from '@/lib/formatear-fecha-hora'
import { cn } from '@/lib/utils'

/** Props de la tabla de cambios (desde xl). */
interface TablaCambiosProps {
  filas: FilaCambio[]
  acciones: PropiedadesAccionesCambio
}

// --- DISTRIBUCION ---
// Misma idea que la tabla del Historial: grilla con subgrid, cada columna mide lo que su contenido y el
// espacio sobrante se reparte en separaciones iguales. Los articulos llevan un ancho maximo y se cortan
// con puntos suspensivos (el nombre completo queda en el title).
// pl-4 / pr-1: el boton de icono ya trae 12 px de aire propio, asi el ultimo queda a 16 px del borde.
const CLASE_FILA = 'col-span-full grid grid-cols-subgrid items-center border-b pr-1 pl-4'

export function TablaCambios({ filas, acciones }: TablaCambiosProps) {
  return (
    <Card className="gap-0 overflow-hidden p-0 shadow-none">
      <div
        role="table"
        aria-label="Cambios registrados, del más nuevo al más viejo"
        className="grid grid-cols-[repeat(7,auto)] justify-between gap-x-4 text-sm"
      >
        {/* --- ENCABEZADO --- */}
        <div role="row" className={cn(CLASE_FILA, 'min-h-11 font-medium text-texto-suave')}>
          <span role="columnheader">Fecha y hora</span>
          <span role="columnheader">Venta vinculada</span>
          <span role="columnheader">Devuelto</span>
          <span role="columnheader">Entregado</span>
          <span role="columnheader">Estado</span>
          <span role="columnheader" className="justify-self-end">
            Saldo
          </span>
          <span role="columnheader">
            <span className="sr-only">Acciones</span>
          </span>
        </div>

        {/* --- FILAS --- */}
        {filas.map((fila) => (
          <div
            key={fila.idCambio}
            role="row"
            className={cn(CLASE_FILA, 'min-h-21 py-2 transition-colors last:border-b-0 hover:bg-fondo-hover/60')}
          >
            <div role="cell" className="whitespace-nowrap tabular-nums">
              <p className="font-bold">{formatearFecha(fila.fechaHora)}</p>
              <p className="text-xs text-texto-suave">{formatearHora(fila.fechaHora)}</p>
            </div>
            <div role="cell" className="whitespace-nowrap">
              <TextoVentaVinculada fila={fila} />
            </div>
            <div role="cell" className="w-40">
              <ArticuloDevueltoFila fila={fila} />
            </div>
            <div role="cell" className="w-40">
              <ArticuloEntregadoFila fila={fila} />
            </div>
            <div role="cell" className="flex flex-col items-start gap-1">
              <InsigniaEstadoCambio estado={fila.estado} />
              <AvisoVentanaCambio fila={fila} className="max-w-40" />
            </div>

            {/* --- SALDO, A LA DERECHA, Y EL MEDIO DE PAGO DEBAJO --- */}
            <div role="cell" className="flex flex-col items-end gap-0.5 justify-self-end">
              <SaldoCambio saldo={fila.saldoResultante} anulado={fila.estado === 'ANULADO'} />
              {fila.nombreMedioPago && <span className="text-xs text-texto-suave">{fila.nombreMedioPago}</span>}
            </div>
            <div role="cell">
              <AccionesCambio fila={fila} acciones={acciones} variante="tabla" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
