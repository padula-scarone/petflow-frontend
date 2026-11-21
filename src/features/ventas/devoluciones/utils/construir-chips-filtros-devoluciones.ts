import { PRESENTACION_ESTADO_DEVOLUCION } from '@/features/ventas/devoluciones/config/estados-devolucion'
import type { PropiedadesFiltrosDevoluciones } from '@/features/ventas/devoluciones/types/devolucion'
import type { ChipFiltro } from '@/features/ventas/types/compartidos'
import { describirProductoFiltro, describirRangoFechas } from '@/features/ventas/utils/construir-chips-filtros-historial'

/**
 * Arma los chips de los filtros de la lista de devoluciones.
 * soloAdicionales = true (escritorio): solo los de "Mas filtros", que no se ven en la barra.
 * soloAdicionales = false (mobile): todos, porque la hoja de filtros esta cerrada.
 */
export function construirChipsFiltrosDevoluciones(
  propiedades: PropiedadesFiltrosDevoluciones,
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
        etiqueta: describirProductoFiltro(filtros.productoSeleccionado),
        descripcion: 'el producto',
        onQuitar: () => onSeleccionarProducto(null),
      })
    }
    if (filtros.estado) {
      chips.push({
        clave: 'estado',
        etiqueta: PRESENTACION_ESTADO_DEVOLUCION[filtros.estado].etiqueta,
        descripcion: 'el estado',
        onQuitar: () => onCambiarFiltros({ estado: null }),
      })
    }
  }

  // --- FILTROS DE "MAS FILTROS" ---
  if (filtros.vinculo) {
    chips.push({
      clave: 'vinculo',
      etiqueta: filtros.vinculo === 'VINCULADO' ? 'Con venta vinculada' : 'Sin venta vinculada',
      descripcion: 'la vinculación',
      onQuitar: () => onCambiarFiltros({ vinculo: null }),
    })
  }
  if (filtros.medioPago !== null) {
    chips.push({
      clave: 'medio-pago',
      etiqueta:
        opciones.mediosPago.find((medio) => medio.idMedioPago === filtros.medioPago)?.nombre ??
        'Medio de pago',
      descripcion: 'el medio de pago',
      onQuitar: () => onCambiarFiltros({ medioPago: null }),
    })
  }

  return chips
}
