import { PRESENTACION_ESTADO_CAMBIO } from '@/features/ventas/cambios-mercaderia/config/estados-cambio'
import type {
  EstadoCambio,
  FilaCambio,
  PropiedadesAccionesCambio,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import {
  describirCantidadArticulo,
  describirDevolucion,
} from '@/features/ventas/cambios-mercaderia/utils/describir-articulo-cambio'
import { AccionesRegistroModificable } from '@/features/ventas/components/acciones-registro-modificable'
import { AvisoVentanaModificacion } from '@/features/ventas/components/aviso-ventana-modificacion'
import { InsigniaEstado } from '@/features/ventas/components/insignia-estado'
import { cn } from '@/lib/utils'

// Piezas que comparten la tarjeta (mobile) y la tabla (escritorio) de un cambio.

/** Insignia con el estado de un cambio. */
export function InsigniaEstadoCambio({ estado, className }: { estado: EstadoCambio; className?: string }) {
  return <InsigniaEstado presentacion={PRESENTACION_ESTADO_CAMBIO[estado]} className={className} />
}

/** Texto de la venta vinculada o, si no hay, "Sin venta vinculada" en gris. */
export function TextoVentaVinculada({ fila, className }: { fila: FilaCambio; className?: string }) {
  if (fila.ventaVinculada === null) {
    return <span className={cn('text-texto-suave', className)}>Sin venta vinculada</span>
  }
  return <span className={cn('font-medium tabular-nums', className)}>{fila.ventaVinculada.numeroComprobante}</span>
}

/** Props de un articulo del cambio en dos lineas: nombre y cantidad. */
interface ArticuloListadoProps {
  nombreProducto: string
  /** Ya descrita: "2 u", "2,5 kg" o "Bolsa abierta · 7,2 kg". */
  descripcionCantidad: string
  className?: string
}

export function ArticuloListado({ nombreProducto, descripcionCantidad, className }: ArticuloListadoProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <p className="truncate font-medium" title={nombreProducto}>
        {nombreProducto}
      </p>
      <p className="text-xs text-texto-suave tabular-nums">{descripcionCantidad}</p>
    </div>
  )
}

/** Articulo devuelto de una fila, con su cantidad o el peso de la bolsa abierta. */
export function ArticuloDevueltoFila({ fila, className }: { fila: FilaCambio; className?: string }) {
  const { productoDevuelto } = fila
  return (
    <ArticuloListado
      nombreProducto={productoDevuelto.nombreProducto}
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
export function ArticuloEntregadoFila({ fila, className }: { fila: FilaCambio; className?: string }) {
  const { productoEntregado } = fila
  return (
    <ArticuloListado
      nombreProducto={productoEntregado.nombreProducto}
      descripcionCantidad={describirCantidadArticulo(productoEntregado.cantidad, productoEntregado.formatoVenta)}
      className={className}
    />
  )
}

/** Aviso de la ventana de 15 minutos de un cambio. */
export function AvisoVentanaCambio({ fila, className }: { fila: FilaCambio; className?: string }) {
  return (
    <AvisoVentanaModificacion
      ventanaVigente={fila.ventanaVigente}
      fechaHoraLimiteModificacion={fila.fechaHoraLimiteModificacion}
      className={className}
    />
  )
}

/** Props de los botones Ver, Editar y Anular de un cambio. */
interface AccionesCambioProps {
  fila: FilaCambio
  acciones: PropiedadesAccionesCambio
  variante: 'tabla' | 'tarjeta' | 'detalle'
}

/** Acciones de un cambio: enlaza los callbacks con los botones genericos. */
export function AccionesCambio({ fila, acciones, variante }: AccionesCambioProps) {
  return (
    <AccionesRegistroModificable
      nombreRegistro={`cambio ${fila.idCambio}`}
      sustantivo="cambio"
      ventanaVigente={fila.ventanaVigente}
      variante={variante}
      onVerDetalle={() => acciones.onVerDetalleCambio(fila.idCambio)}
      onEditar={() => acciones.onEditarCambio(fila.idCambio)}
      onAnular={() => acciones.onAnularCambio(fila.idCambio)}
    />
  )
}
