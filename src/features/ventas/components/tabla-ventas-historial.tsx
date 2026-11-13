import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatearFecha, formatearHora } from '@/lib/formatear-fecha-hora'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { AccionesVentaHistorial } from '@/features/ventas/components/acciones-venta-historial'
import { AvisoVentanaVenta } from '@/features/ventas/components/aviso-ventana-venta'
import { BotonCobrarFiado } from '@/features/ventas/components/boton-cobrar-fiado'
import { InsigniaEstadoVenta } from '@/features/ventas/components/insignia-estado-venta'
import type { FilaHistorial, PropiedadesAccionesVenta } from '@/features/ventas/types/historial'
import { describirEntrega, describirOrigen } from '@/features/ventas/utils/describir-origen-entrega'

/** Props de la tabla de ventas (desde xl). */
interface TablaVentasHistorialProps {
  filas: FilaHistorial[]
  acciones: PropiedadesAccionesVenta
}

// --- DISTRIBUCION ---
// Grilla y no <table>: cada columna mide lo que su contenido y el espacio sobrante se reparte en
// separaciones iguales (justify-between). Una <table> a todo el ancho mete ese sobrante dentro de las
// columnas y deja huecos desparejos, sobre todo entre una columna alineada a la izquierda y otra a la derecha.
// Las filas usan subgrid para compartir las mismas columnas.
// pl-4 / pr-1: el boton de icono ya trae 12 px de aire propio, asi el tacho queda a 16 px del borde,
// igual que el numero de comprobante del otro lado.
const CLASE_FILA = 'col-span-full grid grid-cols-subgrid items-center border-b pr-1 pl-4'

export function TablaVentasHistorial({ filas, acciones }: TablaVentasHistorialProps) {
  return (
    <Card className="gap-0 overflow-hidden p-0 shadow-none">
      <div
        role="table"
        aria-label="Ventas registradas, de la más nueva a la más vieja"
        className="grid grid-cols-[repeat(7,auto)] justify-between text-sm"
      >
        {/* --- ENCABEZADO --- */}
        <div role="row" className={cn(CLASE_FILA, 'min-h-11 font-medium text-texto-suave')}>
          <span role="columnheader">N.º de comprobante</span>
          <span role="columnheader">Fecha y hora</span>
          <span role="columnheader">Origen</span>
          <span role="columnheader">Entrega</span>
          <span role="columnheader">Estado</span>
          <span role="columnheader" className="justify-self-end">
            Total
          </span>
          <span role="columnheader">
            <span className="sr-only">Acciones</span>
          </span>
        </div>

        {/* --- FILAS --- */}
        {/* Alto minimo parejo: el de la fila mas alta (un fiado, con total y boton Cobrar) */}
        {filas.map((fila) => (
          <div
            key={fila.idVenta}
            role="row"
            className={cn(CLASE_FILA, 'min-h-[5.25rem] py-2 transition-colors last:border-b-0 hover:bg-fondo-hover/60')}
          >
            {/* --- COMPROBANTE Y, SI EXISTE, CLIENTE --- */}
            <div role="cell" className="min-w-0">
              <p className="font-bold whitespace-nowrap tabular-nums">{fila.numeroComprobante}</p>
              {fila.clienteReferencia !== null && (
                <p className="max-w-40 truncate text-xs text-texto-suave">
                  Cliente: {fila.clienteReferencia}
                </p>
              )}
            </div>
            <div role="cell" className="whitespace-nowrap tabular-nums">
              <p>{formatearFecha(fila.fechaHora)}</p>
              <p className="text-xs text-texto-suave">{formatearHora(fila.fechaHora)}</p>
            </div>
            <div role="cell">{describirOrigen(fila.origen)}</div>
            <div role="cell">{describirEntrega(fila.modalidadEntrega)}</div>
            <div role="cell" className="flex flex-col items-start gap-1">
              <InsigniaEstadoVenta estado={fila.estado} />
              <AvisoVentanaVenta fila={fila} className="max-w-40" />
            </div>

            {/* --- TOTAL, Y COBRAR DEBAJO SOLO EN UN FIADO --- */}
            <div role="cell" className="flex flex-col items-end gap-1 justify-self-end">
              <span
                className={cn(
                  'font-bold whitespace-nowrap tabular-nums',
                  fila.estado === 'ANULADA' && 'font-normal text-texto-suave',
                )}
              >
                {formatearMoneda(fila.montoTotal)}
              </span>
              <BotonCobrarFiado fila={fila} onCobrarFiado={acciones.onCobrarFiado} />
            </div>
            <div role="cell">
              <AccionesVentaHistorial fila={fila} acciones={acciones} variante="tabla" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
