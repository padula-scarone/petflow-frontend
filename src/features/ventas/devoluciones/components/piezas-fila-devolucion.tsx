import { PRESENTACION_ESTADO_DEVOLUCION } from '@/features/ventas/devoluciones/config/estados-devolucion'
import type {
  EstadoDevolucion,
  FilaDevolucion,
  PropiedadesAccionesDevolucion,
} from '@/features/ventas/devoluciones/types/devolucion'
import {
  describirCantidadArticulo,
  describirDevolucion,
} from '@/features/ventas/devoluciones/utils/describir-articulo-devolucion'
import { AccionesRegistroModificable } from '@/features/ventas/components/acciones-registro-modificable'
import { AvisoVentanaModificacion } from '@/features/ventas/components/aviso-ventana-modificacion'
import { InsigniaEstado } from '@/features/ventas/components/insignia-estado'
import type { FormatoVenta } from '@/features/ventas/types/historial'
import { describirPresentacion } from '@/features/ventas/utils/describir-presentacion'
import { cn } from '@/lib/utils'

// Piezas que comparten la tarjeta (mobile) y la tabla (escritorio) de una devolución.

/** Insignia con el estado de una devolución. */
export function InsigniaEstadoDevolucion({ estado, className }: { estado: EstadoDevolucion; className?: string }) {
  return <InsigniaEstado presentacion={PRESENTACION_ESTADO_DEVOLUCION[estado]} className={className} />
}

/** Texto de la venta vinculada o, si no hay, "Sin venta vinculada" en gris. */
export function TextoVentaVinculada({ fila, className }: { fila: FilaDevolucion; className?: string }) {
  if (fila.ventaVinculada === null) {
    return <span className={cn('text-texto-suave', className)}>Sin venta vinculada</span>
  }
  return <span className={cn('font-medium tabular-nums', className)}>{fila.ventaVinculada.numeroComprobante}</span>
}

/** Props de un articulo de la devolución en dos lineas: nombre y cantidad. */
interface ArticuloListadoProps {
  nombreProducto: string
  formatoVenta: FormatoVenta
  /** Ya descrita: "2 u", "2,5 kg" o "Bolsa abierta · 7,2 kg". */
  descripcionCantidad: string
  className?: string
}

export function ArticuloListado({ nombreProducto, formatoVenta, descripcionCantidad, className }: ArticuloListadoProps) {
  const presentacion = describirPresentacion(formatoVenta)

  return (
    <div className={cn('min-w-0', className)}>
      {/* El nombre se corta con puntos suspensivos y la presentacion queda afuera del corte: si no, seria lo primero
          que se pierde en un nombre largo */}
      <p className="flex min-w-0" title={`${nombreProducto} | ${presentacion}`}>
        <span className="truncate font-medium">{nombreProducto}</span>
        <span className="shrink-0 whitespace-nowrap">{`\u00a0| ${presentacion}`}</span>
      </p>
      <p className="text-auxiliar text-texto-suave tabular-nums">{descripcionCantidad}</p>
    </div>
  )
}

/** Articulo devuelto de una fila, con su cantidad o el peso de la bolsa abierta. */
export function ArticuloDevueltoFila({ fila, className }: { fila: FilaDevolucion; className?: string }) {
  const { productoDevuelto } = fila
  return (
    <ArticuloListado
      nombreProducto={productoDevuelto.nombreProducto}
      formatoVenta={productoDevuelto.formatoVenta}
      descripcionCantidad={describirDevolucion(
        productoDevuelto.cantidad,
        productoDevuelto.formatoVenta,
        productoDevuelto.pesoDevueltoKg,
      )}
      className={className}
    />
  )
}

/** Articulo entregado de una fila. */
export function ArticuloEntregadoFila({ fila, className }: { fila: FilaDevolucion; className?: string }) {
  const { productoEntregado } = fila
  return (
    <ArticuloListado
      nombreProducto={productoEntregado.nombreProducto}
      formatoVenta={productoEntregado.formatoVenta}
      descripcionCantidad={describirCantidadArticulo(productoEntregado.cantidad, productoEntregado.formatoVenta)}
      className={className}
    />
  )
}

/** Aviso de la ventana de 15 minutos de una devolución. */
export function AvisoVentanaDevolucion({ fila, className }: { fila: FilaDevolucion; className?: string }) {
  return (
    <AvisoVentanaModificacion
      ventanaVigente={fila.ventanaVigente}
      fechaHoraLimiteModificacion={fila.fechaHoraLimiteModificacion}
      className={className}
    />
  )
}

/** Props de los botones Ver, Editar y Anular de una devolución. */
interface AccionesDevolucionProps {
  fila: FilaDevolucion
  acciones: PropiedadesAccionesDevolucion
  variante: 'tabla' | 'tarjeta' | 'detalle'
}

/** Acciones de una devolución: enlaza los callbacks con los botones genericos. */
export function AccionesDevolucion({ fila, acciones, variante }: AccionesDevolucionProps) {
  return (
    <AccionesRegistroModificable
      nombreRegistro={`devolución ${fila.idDevolucion}`}
      sustantivo="devolucion"
      ventanaVigente={fila.ventanaVigente}
      variante={variante}
      onVerDetalle={() => acciones.onVerDetalleDevolucion(fila.idDevolucion)}
      onEditar={() => acciones.onEditarDevolucion(fila.idDevolucion)}
      onAnular={() => acciones.onAnularDevolucion(fila.idDevolucion)}
    />
  )
}
