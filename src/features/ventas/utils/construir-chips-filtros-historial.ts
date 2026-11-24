import { PRESENTACION_ESTADO_VENTA } from '@/features/ventas/config/estados-venta'
import type { ChipFiltro } from '@/features/ventas/types/compartidos'
import type { ProductoFiltro, PropiedadesFiltrosHistorial } from '@/features/ventas/types/historial'
import { describirEntrega, describirOrigen } from '@/features/ventas/utils/describir-origen-entrega'
import { describirPresentacion } from '@/features/ventas/utils/describir-presentacion'
import { formatearFechaCalendarioLegible } from '@/features/ventas/utils/formatear-fecha-calendario-legible'

/** Texto de un rango de fechas: un dia, "d – h", "Desde d" o "Hasta h". */
export function describirRangoFechas(fechaDesde: string | null, fechaHasta: string | null) {
  const desde = fechaDesde ? formatearFechaCalendarioLegible(fechaDesde) : null
  const hasta = fechaHasta ? formatearFechaCalendarioLegible(fechaHasta) : null
  if (desde && hasta) return desde === hasta ? desde : `${desde} – ${hasta}`
  return desde ? `Desde ${desde}` : `Hasta ${hasta}`
}

/**
 * Arma los chips de los filtros del historial que no estan a la vista, en el mismo orden que los controles.
 * soloAdicionales = true (escritorio): solo los de "Mas filtros".
 * soloAdicionales = false (mobile): todos los de la hoja, porque esta cerrada. El N.º de comprobante nunca lleva chip:
 * su texto esta siempre a la vista en su campo.
 */
export function construirChipsFiltrosHistorial(
  propiedades: PropiedadesFiltrosHistorial,
  soloAdicionales: boolean,
): ChipFiltro[] {
  const { filtros, opciones, onCambiarFiltros, onSeleccionarProducto } = propiedades
  const chips: ChipFiltro[] = []

  // --- FILTROS QUE EN ESCRITORIO SE VEN EN LA BARRA (MOBILE: ESTAN EN LA HOJA) ---
  if (!soloAdicionales) {
    if (filtros.productoSeleccionado) {
      chips.push({
        clave: 'producto',
        etiqueta: describirProductoFiltro(filtros.productoSeleccionado),
        descripcion: 'el producto',
        onQuitar: () => onSeleccionarProducto(null),
      })
    }
    if (filtros.fechaDesde !== null || filtros.fechaHasta !== null) {
      chips.push({
        clave: 'fechas',
        etiqueta: describirRangoFechas(filtros.fechaDesde, filtros.fechaHasta),
        descripcion: 'las fechas',
        onQuitar: () => onCambiarFiltros({ fechaDesde: null, fechaHasta: null }),
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
        clave: 'deudor',
        etiqueta: `Deudor: ${filtros.textoCliente.trim()}`,
        descripcion: 'el deudor',
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
  if (filtros.modalidadEntrega) {
    chips.push({
      clave: 'entrega',
      etiqueta: describirEntrega(filtros.modalidadEntrega),
      descripcion: 'la entrega',
      onQuitar: () => onCambiarFiltros({ modalidadEntrega: null }),
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

  return chips
}

/** "Nombre | Presentacion" del producto elegido como filtro; solo el nombre si el dato no trae la presentacion. */
export function describirProductoFiltro(producto: ProductoFiltro) {
  return producto.formato
    ? `${producto.nombreProducto} | ${describirPresentacion(producto.formato)}`
    : producto.nombreProducto
}
