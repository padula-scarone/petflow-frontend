import type {
  DevolucionDetalle,
  DevolucionListado,
  FilaDevolucion,
} from '@/features/ventas/devoluciones/types/devolucion'

/**
 * Convierte una devolución de la grilla en una fila con su ventana evaluada contra la hora del servidor. El limite
 * (`fechaHoraLimiteModificacion`) lo calcula el back; aca solo se compara con la hora del servidor estimada.
 */
export function crearFilaDevolucion(devolucion: DevolucionListado, ahoraServidorMilisegundos: number): FilaDevolucion {
  const limite = devolucion.fechaHoraLimiteModificacion
  return {
    ...devolucion,
    ventanaVigente:
      devolucion.estado === 'ACTIVO' && limite !== null && Date.parse(limite) > ahoraServidorMilisegundos,
  }
}

/** Deja de una devolución completa solo los campos que muestra la grilla (para armar la fila del detalle abierto). */
export function convertirDevolucionAListado(devolucion: DevolucionDetalle): DevolucionListado {
  const { articuloDevuelto, articuloEntregado, pagoSaldo } = devolucion
  return {
    idDevolucion: devolucion.idDevolucion,
    fechaHora: devolucion.fechaHora,
    estado: devolucion.estado,
    ventaVinculada: devolucion.ventaVinculada,
    productoDevuelto: {
      idProducto: articuloDevuelto.idProducto,
      nombreProducto: articuloDevuelto.nombreProducto,
      formatoVenta: articuloDevuelto.formatoVenta,
      cantidad: articuloDevuelto.cantidad,
      esBolsaAbierta: articuloDevuelto.esBolsaAbierta,
      pesoDevueltoKg: articuloDevuelto.pesoDevueltoKg,
    },
    productoEntregado: {
      idProducto: articuloEntregado.idProducto,
      nombreProducto: articuloEntregado.nombreProducto,
      formatoVenta: articuloEntregado.formatoVenta,
      cantidad: articuloEntregado.cantidad,
    },
    saldoResultante: devolucion.saldoResultante,
    idMedioPago: pagoSaldo?.idMedioPago ?? null,
    nombreMedioPago: pagoSaldo?.nombreMedioPago ?? null,
    fechaHoraLimiteModificacion: devolucion.fechaHoraLimiteModificacion,
  }
}
