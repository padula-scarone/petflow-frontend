import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PRESENTACION_ESTADO_VENTA } from '@/features/ventas/config/estados-venta'
import type { PropiedadesFiltrosHistorial } from '@/features/ventas/types/historial'
import { describirOrigen } from '@/features/ventas/utils/describir-origen-entrega'
import { formatearFechaCalendarioLegible } from '@/features/ventas/utils/formatear-fecha-calendario-legible'

/** Props de los chips con los filtros aplicados. */
interface ResumenFiltrosActivosProps {
  propiedades: PropiedadesFiltrosHistorial
  /**
   * true (escritorio): solo los filtros de "Mas filtros", que no se ven en la barra.
   * false (mobile): todos, porque la hoja de filtros esta cerrada.
   */
  soloAdicionales: boolean
  className?: string
}

interface Chip {
  etiqueta: string
  descripcion: string
  onQuitar: () => void
}

export function ResumenFiltrosActivos({
  propiedades,
  soloAdicionales,
  className,
}: ResumenFiltrosActivosProps) {
  const { filtros, opciones, onCambiarFiltros, onSeleccionarProducto } = propiedades
  const chips: Chip[] = []

  // --- FILTROS QUE SOLO SE VEN EN LA BARRA (MOBILE: NO HAY BARRA) ---
  if (!soloAdicionales) {
    if (filtros.fechaDesde !== null || filtros.fechaHasta !== null) {
      const desde = filtros.fechaDesde ? formatearFechaCalendarioLegible(filtros.fechaDesde) : null
      const hasta = filtros.fechaHasta ? formatearFechaCalendarioLegible(filtros.fechaHasta) : null
      chips.push({
        etiqueta:
          desde && hasta ? (desde === hasta ? desde : `${desde} – ${hasta}`) : desde ? `Desde ${desde}` : `Hasta ${hasta}`,
        descripcion: 'las fechas',
        onQuitar: () => onCambiarFiltros({ fechaDesde: null, fechaHasta: null }),
      })
    }
    if (filtros.productoSeleccionado) {
      chips.push({
        etiqueta: filtros.productoSeleccionado.nombreProducto,
        descripcion: 'el producto',
        onQuitar: () => onSeleccionarProducto(null),
      })
    }
    if (filtros.estado) {
      chips.push({
        etiqueta: PRESENTACION_ESTADO_VENTA[filtros.estado].etiqueta,
        descripcion: 'el estado',
        onQuitar: () => onCambiarFiltros({ estado: null }),
      })
    }
    if (filtros.textoCliente.trim() !== '') {
      chips.push({
        etiqueta: `Cliente: ${filtros.textoCliente.trim()}`,
        descripcion: 'el cliente',
        onQuitar: () => onCambiarFiltros({ textoCliente: '' }),
      })
    }
  }

  // --- FILTROS DE "MAS FILTROS" ---
  if (filtros.origen) {
    chips.push({
      etiqueta: describirOrigen(filtros.origen),
      descripcion: 'el origen',
      onQuitar: () => onCambiarFiltros({ origen: null }),
    })
  }
  if (filtros.medioPago !== null) {
    chips.push({
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
      etiqueta: filtros.numeroComprobante.trim(),
      descripcion: 'el comprobante',
      onQuitar: () => onCambiarFiltros({ numeroComprobante: '' }),
    })
  }

  if (chips.length === 0) return null

  return (
    <ul aria-label="Filtros aplicados" className={cn('flex flex-wrap gap-2', className)}>
      {chips.map((chip) => (
        <li key={chip.descripcion}>
          <Button
            type="button"
            variant="outline"
            aria-label={`Quitar el filtro de ${chip.descripcion}: ${chip.etiqueta}`}
            className="h-11 max-w-full gap-1.5 rounded-full bg-fondo-seleccion px-4 text-sm"
            onClick={chip.onQuitar}
          >
            <span className="truncate">{chip.etiqueta}</span>
            <X />
          </Button>
        </li>
      ))}
    </ul>
  )
}
