import { SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FiltroEstado } from '@/features/ventas/components/filtro-estado'
import { FiltroProducto } from '@/features/ventas/components/filtro-producto'
import { FiltroRangoFechas } from '@/features/ventas/components/filtro-rango-fechas'
import { FiltrosAdicionalesHistorial } from '@/features/ventas/components/filtros-adicionales-historial'
import type { PropiedadesFiltrosHistorial } from '@/features/ventas/types/historial'

/** Props de la barra de filtros de escritorio. */
interface BarraFiltrosHistorialProps {
  propiedades: PropiedadesFiltrosHistorial
}

/**
 * Una sola fila de controles de la misma altura: fecha, producto y estado (los del SSOT), el cliente
 * cuando el estado es "Pendiente de pago", y "Mas filtros". Sin etiquetas visibles: cada control se
 * entiende por su valor o su placeholder y lleva su aria-label.
 */
export function BarraFiltrosHistorial({ propiedades }: BarraFiltrosHistorialProps) {
  const {
    filtros,
    opciones,
    cantidadFiltrosAdicionales,
    periodoRapidoActivo,
    onCambiarFiltros,
    onSeleccionarPeriodoRapido,
    onBuscarProducto,
    onSeleccionarProducto,
  } = propiedades

  return (
    // auto-fit: los controles se reparten parejos y, si no entran, bajan alineados por columna
    <div className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-3">
      <FiltroRangoFechas
        idCampo="barra-fecha"
        variante="barra"
        fechaDesde={filtros.fechaDesde}
        fechaHasta={filtros.fechaHasta}
        periodoRapidoActivo={periodoRapidoActivo}
        onCambiarFiltros={onCambiarFiltros}
        onSeleccionarPeriodoRapido={onSeleccionarPeriodoRapido}
      />
      <FiltroProducto
        idCampo="barra-producto"
        variante="barra"
        productoSeleccionado={filtros.productoSeleccionado}
        textoBusqueda={opciones.textoBusquedaProducto}
        productosCoincidentes={opciones.productosCoincidentes}
        onBuscarProducto={onBuscarProducto}
        onSeleccionarProducto={onSeleccionarProducto}
      />
      <FiltroEstado
        idCampo="barra-estado"
        variante="barra"
        estado={filtros.estado}
        onCambiarEstado={(estado) => onCambiarFiltros({ estado })}
      />

      {/* --- CLIENTE: SOLO CON "PENDIENTE DE PAGO" --- */}
      {filtros.estado === 'PENDIENTE_PAGO' && (
        <Input
          type="text"
          autoComplete="off"
          placeholder="Buscar cliente"
          aria-label="Cliente"
          className="h-11 bg-fondo-tarjeta"
          value={filtros.textoCliente}
          onChange={(evento) => onCambiarFiltros({ textoCliente: evento.target.value })}
        />
      )}

      {/* --- MAS FILTROS --- */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full gap-2 bg-fondo-tarjeta"
          >
            <SlidersHorizontal />
            Más filtros
            {cantidadFiltrosAdicionales > 0 && (
              <Badge className="size-6 justify-center rounded-full p-0 tabular-nums">
                <span className="sr-only">Activos: </span>
                {cantidadFiltrosAdicionales}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-4">
          <FiltrosAdicionalesHistorial propiedades={propiedades} idPrefijo="barra-adicionales" />
        </PopoverContent>
      </Popover>
    </div>
  )
}
