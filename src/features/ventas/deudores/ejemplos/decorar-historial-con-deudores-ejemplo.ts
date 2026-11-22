import { obtenerFechaHoy, sumarDiasAFecha } from '@/features/ventas/deudores/utils/fechas-estimadas'
import type { FilaHistorial, HistorialVentasProps } from '@/features/ventas/types/historial'

// El back todavia no informa a quien se le fio cada venta (aunque el dato existe), ni cuanto falta ni la fecha
// estimada. Para que "Ver deuda" tenga a donde ir, la maqueta completa esos datos en las filas pendientes del Historial.
// Es deterministico por id de venta: la misma venta siempre se ve igual.

/** Deudores del almacen de ejemplo a los que se asignan los fiados del Historial (ids de datos-deudores-ejemplo). */
const DEUDORES_DEL_HISTORIAL = [
  { idDeudor: 1, nombreCompleto: 'Marta Gimenez' },
  { idDeudor: 2, nombreCompleto: 'Carlos Perez' },
  { idDeudor: 3, nombreCompleto: 'Lucia Fernandez' },
  { idDeudor: 4, nombreCompleto: 'Roberto Sosa' },
  { idDeudor: 5, nombreCompleto: 'Valeria Rios' },
  { idDeudor: 6, nombreCompleto: 'Diego Alvarez' },
]

/** Una de cada cinco ventas pendientes es un fiado viejo, sin deudor: sirve para ver como se comporta. */
const CADA_CUANTAS_SON_VIEJAS = 5
/** Una de cada tres ya pago una parte. */
const CADA_CUANTAS_PAGARON_UNA_PARTE = 3
const PORCENTAJE_PENDIENTE_DEL_PAGO_PARCIAL = 0.6

/** Completa una fila pendiente con deudor, lo que falta y la fecha estimada; el resto de las filas queda igual. */
function decorarFila(fila: FilaHistorial): FilaHistorial {
  if (fila.estado !== 'PENDIENTE_PAGO') return fila
  // Un fiado viejo conserva el cliente como texto libre y no tiene deudor
  if (fila.idVenta % CADA_CUANTAS_SON_VIEJAS === 0) return fila

  const pagoUnaParte = fila.idVenta % CADA_CUANTAS_PAGARON_UNA_PARTE === 0
  return {
    ...fila,
    deudor: DEUDORES_DEL_HISTORIAL[fila.idVenta % DEUDORES_DEL_HISTORIAL.length],
    montoFaltante: pagoUnaParte
      ? Math.round(fila.montoTotal * PORCENTAJE_PENDIENTE_DEL_PAGO_PARCIAL)
      : fila.montoTotal,
    fechaEstimadaPago: fila.idVenta % 4 === 0 ? null : sumarDiasAFecha(obtenerFechaHoy(), (fila.idVenta % 9) - 2),
  }
}

/** Las props del Historial con los fiados pendientes ya decorados, tanto en la lista como en el detalle abierto. */
export function decorarHistorialConDeudoresEjemplo(propiedades: HistorialVentasProps): HistorialVentasProps {
  const { estadoLista, detalle } = propiedades
  return {
    ...propiedades,
    estadoLista:
      estadoLista.tipo === 'con-ventas' ? { ...estadoLista, filas: estadoLista.filas.map(decorarFila) } : estadoLista,
    detalle: detalle?.tipo === 'listo' ? { ...detalle, fila: decorarFila(detalle.fila) } : detalle,
  }
}
