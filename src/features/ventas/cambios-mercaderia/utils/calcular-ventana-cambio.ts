import type {
  CambioMercaderiaDetalle,
  CambioMercaderiaListado,
  FilaCambio,
} from '@/features/ventas/cambios-mercaderia/types/cambio'

/**
 * Convierte un cambio de la grilla en una fila con su ventana evaluada contra la hora del servidor. El limite
 * (`fechaHoraLimiteModificacion`) lo calcula el back; aca solo se compara con la hora del servidor estimada.
 */
export function crearFilaCambio(cambio: CambioMercaderiaListado, ahoraServidorMilisegundos: number): FilaCambio {
  const limite = cambio.fechaHoraLimiteModificacion
  return {
    ...cambio,
    ventanaVigente:
      cambio.estado === 'ACTIVO' && limite !== null && Date.parse(limite) > ahoraServidorMilisegundos,
  }
}

/** Deja de un cambio completo solo los campos que muestra la grilla (para armar la fila del detalle abierto). */
export function convertirCambioAListado(cambio: CambioMercaderiaDetalle): CambioMercaderiaListado {
  const { articuloDevuelto, articuloEntregado, pagoSaldo } = cambio
  return {
    idCambio: cambio.idCambio,
    fechaHora: cambio.fechaHora,
    estado: cambio.estado,
    ventaVinculada: cambio.ventaVinculada,
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
    saldoResultante: cambio.saldoResultante,
    idMedioPago: pagoSaldo?.idMedioPago ?? null,
    nombreMedioPago: pagoSaldo?.nombreMedioPago ?? null,
    fechaHoraLimiteModificacion: cambio.fechaHoraLimiteModificacion,
  }
}
