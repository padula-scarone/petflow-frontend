import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { formatearFecha } from '@/lib/formatear-fecha-hora'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { BotonPagosFiado } from '@/features/ventas/deudores/components/boton-pagos-fiado'
import { CampoMontoFiado } from '@/features/ventas/deudores/components/campo-monto-fiado'
import { EstadoProximoPago } from '@/features/ventas/deudores/components/estado-proximo-pago'
import { ListaPagosFiado } from '@/features/ventas/deudores/components/lista-pagos-fiado'
import type { FilaFiadoSeleccionable, ResumenSeleccionFiados } from '@/features/ventas/deudores/types/cobro-deudor'

/** Props de la tabla de fiados pendientes (desde xl). */
interface TablaFiadosPendientesProps {
  filas: FilaFiadoSeleccionable[]
  resumen: ResumenSeleccionFiados
  onAlternarFiado: (idVenta: number) => void
  onCambiarMontoFiado: (idVenta: number, monto: number | null) => void
  onSeleccionarTodos: () => void
}

// Misma distribucion que las otras tablas: grilla con subgrid, cada columna mide lo que su contenido.
const CLASE_FILA = 'col-span-full grid grid-cols-subgrid items-center border-b px-contorno'

/** Props de una fila de la tabla. */
interface FilaTablaFiadoProps {
  fila: FilaFiadoSeleccionable
  onAlternarFiado: (idVenta: number) => void
  onCambiarMontoFiado: (idVenta: number, monto: number | null) => void
}

/**
 * Una fila de la tabla y, debajo, sus pagos cuando se despliegan. El fiado que llego desde "Ver deuda" se resalta
 * y se lleva a la vista.
 */
function FilaTablaFiado({ fila, onAlternarFiado, onCambiarMontoFiado }: FilaTablaFiadoProps) {
  const { fiado } = fila
  const referencia = useRef<HTMLDivElement>(null)
  // Solo estado de presentacion: si los pagos estan desplegados
  const [pagosAbiertos, setPagosAbiertos] = useState(false)
  const idListaPagos = `pagos-fiado-${fiado.idVenta}`

  useEffect(() => {
    if (fila.resaltado) referencia.current?.scrollIntoView({ block: 'center' })
  }, [fila.resaltado])

  return (
    <>
      <div
        ref={referencia}
        role="row"
        aria-selected={fila.seleccionado}
        className={cn(
          CLASE_FILA,
          'min-h-16 py-2 transition-colors hover:bg-fondo-hover/60',
          pagosAbiertos ? 'border-b-0' : 'last:border-b-0',
          fila.seleccionado && 'bg-fondo-seleccion/50 hover:bg-fondo-seleccion/50',
          fila.resaltado && 'bg-fondo-seleccion hover:bg-fondo-seleccion',
        )}
      >
        <div role="cell">
          {/* El label es el area de toque: de al menos 44 px, aunque la casilla mida menos */}
          <label className="-ml-3 flex min-h-11 min-w-11 cursor-pointer items-center justify-center">
            <Checkbox
              checked={fila.seleccionado}
              aria-label={`Cobrar el fiado ${fiado.numeroComprobante}`}
              onCheckedChange={() => onAlternarFiado(fiado.idVenta)}
            />
          </label>
        </div>
        <div role="cell" className="whitespace-nowrap tabular-nums">
          <p className="font-bold">{fiado.numeroComprobante}</p>
          <p className="text-auxiliar text-texto-suave">{formatearFecha(fiado.fechaHora)}</p>
        </div>
        <div role="cell">
          <EstadoProximoPago
            fecha={fiado.fechaEstimadaPago}
            vencido={fiado.fechaEstimadaVencida}
            tieneSaldo
          />
        </div>
        {/* --- LO QUE FALTA, DE CUANTO ERA Y LO YA PAGADO: una sola columna, la tabla no entra con tres --- */}
        <div role="cell" className="flex flex-col items-end justify-self-end whitespace-nowrap tabular-nums">
          <span className="font-bold">{formatearMoneda(fiado.montoFaltante)}</span>
          <span className="text-auxiliar text-texto-suave">de {formatearMoneda(fiado.importeAdeudado)}</span>
          {fiado.pagos.length === 0 ? (
            <span className="text-auxiliar text-texto-suave">Sin pagos</span>
          ) : (
            <BotonPagosFiado
              idLista={idListaPagos}
              numeroComprobante={fiado.numeroComprobante}
              montoPagado={fiado.montoPagado}
              cantidadPagos={fiado.pagos.length}
              prefijo="Pagado "
              abierto={pagosAbiertos}
              onAlternar={() => setPagosAbiertos(!pagosAbiertos)}
              // El boton trae su propio aire: se corre a la derecha para alinear el monto. Sin margen vertical
              // negativo: con el, el fondo del boton se montaba sobre el texto de arriba
              className="-mr-3 text-auxiliar text-texto-suave"
            />
          )}
        </div>
        <div role="cell" className="w-32 justify-self-end">
          <CampoMontoFiado
            idCampo={`monto-fiado-${fiado.idVenta}`}
            etiquetaAccesible={`Monto a cobrar del fiado ${fiado.numeroComprobante}`}
            valor={fila.montoACobrar}
            deshabilitado={!fila.seleccionado}
            error={fila.errorMonto}
            onCambiar={(monto) => onCambiarMontoFiado(fiado.idVenta, monto)}
          />
        </div>
      </div>

      {/* --- PAGOS DEL FIADO --- */}
      {/* Mini tabla con sus propios encabezados, de la columna Comprobante a la columna Falta: asi los montos quedan
          bajo "Falta" y las fechas no se leen como la "Fecha estimada" del fiado */}
      {pagosAbiertos && (
        <div
          role="row"
          className="col-span-full grid grid-cols-subgrid border-b bg-fondo-suave px-contorno py-interno last:border-b-0"
        >
          <div role="cell" className="col-span-3 col-start-2 min-w-0">
            <ListaPagosFiado
              idLista={idListaPagos}
              numeroComprobante={fiado.numeroComprobante}
              pagos={fiado.pagos}
              variante="tabla"
            />
          </div>
        </div>
      )}
    </>
  )
}

/** Tabla con los fiados pendientes de un deudor, para tildar los que se cobran y editar cuanto se cobra de cada uno. */
export function TablaFiadosPendientes({
  filas,
  resumen,
  onAlternarFiado,
  onCambiarMontoFiado,
  onSeleccionarTodos,
}: TablaFiadosPendientesProps) {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <div
        role="table"
        aria-label="Fiados pendientes, del más viejo al más nuevo"
        className="grid grid-cols-[repeat(5,auto)] justify-between gap-x-interno text-cuerpo"
      >
        {/* --- ENCABEZADO --- */}
        <div role="row" className={cn(CLASE_FILA, 'min-h-control font-medium text-texto-suave')}>
          <span role="columnheader">
            <label className="-ml-3 flex min-h-11 min-w-11 cursor-pointer items-center justify-center">
              <Checkbox
                checked={resumen.todosSeleccionados}
                aria-label="Seleccionar todo"
                onCheckedChange={onSeleccionarTodos}
              />
            </label>
          </span>
          <span role="columnheader">Comprobante</span>
          <span role="columnheader">Fecha estimada</span>
          <span role="columnheader" className="justify-self-end">
            Falta
          </span>
          <span role="columnheader" className="justify-self-end">
            A cobrar
          </span>
        </div>

        {/* --- FILAS --- */}
        {filas.map((fila) => (
          <FilaTablaFiado
            key={fila.fiado.idVenta}
            fila={fila}
            onAlternarFiado={onAlternarFiado}
            onCambiarMontoFiado={onCambiarMontoFiado}
          />
        ))}
      </div>
    </Card>
  )
}
