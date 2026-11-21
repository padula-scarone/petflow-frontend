import { Card } from '@/components/ui/card'
import {
  AccionesDevolucion,
  ArticuloDevueltoFila,
  ArticuloEntregadoFila,
  AvisoVentanaDevolucion,
  InsigniaEstadoDevolucion,
  TextoVentaVinculada,
} from '@/features/ventas/devoluciones/components/piezas-fila-devolucion'
import { SaldoDevolucion } from '@/features/ventas/devoluciones/components/saldo-devolucion'
import type { FilaDevolucion, PropiedadesAccionesDevolucion } from '@/features/ventas/devoluciones/types/devolucion'
import { formatearFecha, formatearHora } from '@/lib/formatear-fecha-hora'
import { cn } from '@/lib/utils'

/** Props de la tabla de devoluciones (desde xl). */
interface TablaDevolucionesProps {
  filas: FilaDevolucion[]
  acciones: PropiedadesAccionesDevolucion
}

// --- DISTRIBUCION ---
// Misma idea que la tabla del Historial: grilla con subgrid y cada columna mide lo que su contenido. Las dos de
// articulos son la excepcion: tienen un minimo de 10 rem y se reparten el espacio sobrante, porque el nombre mas la
// presentacion es lo mas largo de la fila. Si no entra se corta con puntos suspensivos (el nombre completo queda
// en el title) y la presentacion siempre se ve. Entre columnas va interno: son elementos de un mismo grupo.
// pl-contorno / pr-interno: el boton de icono ya trae 12 px de aire propio (= interno en PC, que es donde se ve la
// tabla), asi el ultimo queda a un contorno del borde.
const CLASE_FILA = 'col-span-full grid grid-cols-subgrid items-center border-b pr-interno pl-contorno'

export function TablaDevoluciones({ filas, acciones }: TablaDevolucionesProps) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div
        role="table"
        aria-label="Devoluciones registradas, del más nuevo al más viejo"
        className="grid grid-cols-[auto_auto_minmax(10rem,1fr)_minmax(10rem,1fr)_auto_auto_auto] gap-x-interno text-cuerpo"
      >
        {/* --- ENCABEZADO --- */}
        <div role="row" className={cn(CLASE_FILA, 'min-h-control font-medium text-texto-suave')}>
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
            key={fila.idDevolucion}
            role="row"
            className={cn(CLASE_FILA, 'min-h-21 py-2 transition-colors last:border-b-0 hover:bg-fondo-hover/60')}
          >
            <div role="cell" className="whitespace-nowrap tabular-nums">
              <p className="font-bold">{formatearFecha(fila.fechaHora)}</p>
              <p className="text-auxiliar text-texto-suave">{formatearHora(fila.fechaHora)}</p>
            </div>
            <div role="cell" className="whitespace-nowrap">
              <TextoVentaVinculada fila={fila} />
            </div>
            <div role="cell" className="min-w-0">
              <ArticuloDevueltoFila fila={fila} />
            </div>
            <div role="cell" className="min-w-0">
              <ArticuloEntregadoFila fila={fila} />
            </div>
            <div role="cell" className="flex flex-col items-start gap-1">
              <InsigniaEstadoDevolucion estado={fila.estado} />
              <AvisoVentanaDevolucion fila={fila} className="max-w-40" />
            </div>

            {/* --- SALDO, A LA DERECHA, Y EL MEDIO DE PAGO DEBAJO --- */}
            <div role="cell" className="flex flex-col items-end gap-0.5 justify-self-end">
              <SaldoDevolucion saldo={fila.saldoResultante} anulado={fila.estado === 'ANULADO'} />
              {fila.nombreMedioPago && <span className="text-auxiliar text-texto-suave">{fila.nombreMedioPago}</span>}
            </div>
            <div role="cell">
              <AccionesDevolucion fila={fila} acciones={acciones} variante="tabla" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
