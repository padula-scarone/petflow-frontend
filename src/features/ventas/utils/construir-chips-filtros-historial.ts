import { PRESENTACION_ESTADO_VENTA } from '@/features/ventas/config/estados-venta'
import type { ChipFiltro } from '@/features/ventas/types/compartidos'
import type { PropiedadesFiltrosHistorial } from '@/features/ventas/types/historial'
import { describirOrigen } from '@/features/ventas/utils/describir-origen-entrega'
import { formatearFechaCalendarioLegible } from '@/features/ventas/utils/formatear-fecha-calendario-legible'

/** Texto de un rango de fechas: un dia, "d – h", "Desde d" o "Hasta h". */
export function describirRangoFechas(fechaDesde: string | null, fechaHasta: string | null) {
  const desde = fechaDesde ? formatearFechaCalendarioLegible(fechaDesde) : null
  const hasta = fechaHasta ? formatearFechaCalendarioLegible(fechaHasta) : null
  if (desde && hasta) return desde === hasta ? desde : `${desde} – ${hasta}`
  return desde ? `Desde ${desde}` : `Hasta ${hasta}`
}

/**
 * Arma los chips de los filtros del historial.
 * soloAdicionales = true (escritorio): solo los de "Mas filtros", que no se ven en la barra.
 * soloAdicionales = false (mobile): todos, porque la hoja de filtros esta cerrada.
 */
export function construirChipsFiltrosHistorial(
  propiedades: PropiedadesFiltrosHistorial,
  soloAdicionales: boolean,
): ChipFiltro[] {
  const { filtros, opciones, onCambiarFiltros, onSeleccionarProducto } = propiedades
  const chips: ChipFiltro[] = []

  // --- FILTROS QUE SOLO SE VEN EN LA BARRA (MOBILE: NO HAY BARRA) ---
  if (!soloAdicionales) {
    if (filtros.fechaDesde !== null || filtros.fechaHasta !== null) {
      chips.push({
        clave: 'fechas',
        etiqueta: describirRangoFechas(filtros.fechaDesde, filtros.fechaHasta),
        descripcion: 'las fechas',
        onQuitar: () => onCambiarFiltros({ fechaDesde: null, fechaHasta: null }),
      })
    }
    if (filtros.productoSeleccionado) {
      chips.push({
        clave: 'producto',
        etiqueta: filtros.productoSeleccionado.nombreProducto,
        descripcion: 'el producto',
        onQuitar: () => onSeleccionarProducto(null),
      })
    }
    if (filtros.estado) {
      chips.push({
        clave: 'estado',
        etiqueta: PRESENTACION_ESTADO_VENTA[filtros.estado].etiqueta,
        descripcion: 'el estado',
        onQuitar: () => onCambiarFiltros({ estado: null }),
      })
    }
    if (filtros.textoCliente.trim() !== '') {
      chips.push({
        clave: 'cliente',
        etiqueta: `Cliente: ${filtros.textoCliente.trim()}`,
        descripcion: 'el cliente',
        onQuitar: () => onCambiarFiltros({ textoCliente: '' }),
      })
    }
  }

  // --- FILTROS DE "MAS FILTROS" ---
  if (filtros.origen) {
    chips.push({
      clave: 'origen',
      etiqueta: describirOrigen(filtros.origen),
      descripcion: 'el origen',
      onQuitar: () => onCambiarFiltros({ origen: null }),
    })
  }
  if (filtros.medioPago !== null) {
    chips.push({
      clave: 'medio-pago',
      etiqueta:
        filtros.medioPago === 'MIXTO'
          ? 'Pago mixto'
          : (opciones.mediosPago.find((medio) => medio.idMedioPago === filtros.medioPago)?.nombre ??
            'Medio de pago'),
      descripcion: 'el medio de pago',
      onQuitar: () => onCambiarFiltros({ medioPago: null }),
    })
  }
  if (filtros.numeroComprobante.trim() !== '') {
    chips.push({
      clave: 'comprobante',
      etiqueta: filtros.numeroComprobante.trim(),
      descripcion: 'el comprobante',
      onQuitar: () => onCambiarFiltros({ numeroComprobante: '' }),
    })
  }

  return chips
}
