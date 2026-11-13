import { useState } from 'react'
import { FilterX, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { PropiedadesBusquedaVenta } from '@/features/ventas/cambios-mercaderia/types/cambio'
import { contarFiltrosBusquedaVenta } from '@/features/ventas/cambios-mercaderia/utils/estados-iniciales-cambio'
import { CampoFiltroComprobante } from '@/features/ventas/components/campo-filtro-comprobante'
import { FiltroProducto } from '@/features/ventas/components/filtro-producto'
import { FiltroRangoFechas } from '@/features/ventas/components/filtro-rango-fechas'
import { SelectorFiltroMedioPago } from '@/features/ventas/components/selector-filtro-medio-pago'
import { SelectorFiltroOrigen } from '@/features/ventas/components/selector-filtro-origen'

/** Props de los filtros de la busqueda de venta. */
interface FiltrosBusquedaVentaProps {
  propiedades: PropiedadesBusquedaVenta
}

/**
 * Los cinco filtros de la busqueda: fecha, producto, origen, medio de pago y N.º de comprobante. Cada uno con
 * su etiqueta. Van en linea dentro del modal (no en otra hoja encima): en mobile el comprobante, que es lo mas
 * rapido para encontrar una venta, queda a la vista y el resto se despliega con "Mas filtros".
 */
export function FiltrosBusquedaVenta({ propiedades }: FiltrosBusquedaVentaProps) {
  const {
    filtros,
    opciones,
    periodoRapidoActivo,
    onBuscarVenta,
    onSeleccionarPeriodoRapido,
    onBuscarProducto,
    onSeleccionarProducto,
    onLimpiarFiltros,
  } = propiedades
  // Solo estado de presentacion (desplegado o no): no es logica de negocio
  const [desplegado, setDesplegado] = useState(false)
  const cantidadFiltros = contarFiltrosBusquedaVenta(filtros)
  const cantidadSinComprobante = cantidadFiltros - (filtros.numeroComprobante.trim() !== '' ? 1 : 0)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <CampoFiltroComprobante
            idCampo="busqueda-venta-comprobante"
            numeroComprobante={filtros.numeroComprobante}
            onCambiarNumeroComprobante={(numeroComprobante) => onBuscarVenta({ numeroComprobante })}
          />
        </div>
        {/* --- DESPLEGAR EL RESTO (SOLO MOBILE) --- */}
        <Button
          type="button"
          variant="outline"
          className="h-11 shrink-0 gap-2 bg-fondo-tarjeta sm:hidden"
          aria-expanded={desplegado}
          aria-controls="filtros-secundarios-busqueda-venta"
          onClick={() => setDesplegado(!desplegado)}
        >
          <SlidersHorizontal />
          Más filtros
          {cantidadSinComprobante > 0 && (
            <Badge className="size-6 justify-center rounded-full p-0 tabular-nums">
              <span className="sr-only">Activos: </span>
              {cantidadSinComprobante}
            </Badge>
          )}
        </Button>
      </div>

      <div
        id="filtros-secundarios-busqueda-venta"
        className={desplegado ? 'grid gap-3 sm:grid-cols-2' : 'hidden gap-3 sm:grid sm:grid-cols-2'}
      >
        <FiltroRangoFechas
          idCampo="busqueda-venta-fecha"
          variante="hoja"
          fechaDesde={filtros.fechaDesde}
          fechaHasta={filtros.fechaHasta}
          periodoRapidoActivo={periodoRapidoActivo}
          onCambiarFiltros={onBuscarVenta}
          onSeleccionarPeriodoRapido={onSeleccionarPeriodoRapido}
        />
        <FiltroProducto
          idCampo="busqueda-venta-producto"
          variante="hoja"
          productoSeleccionado={filtros.productoSeleccionado}
          textoBusqueda={opciones.textoBusquedaProducto}
          productosCoincidentes={opciones.productosCoincidentes}
          onBuscarProducto={onBuscarProducto}
          onSeleccionarProducto={onSeleccionarProducto}
        />
        <SelectorFiltroOrigen
          idPrefijo="busqueda-venta"
          origen={filtros.origen}
          onCambiarOrigen={(origen) => onBuscarVenta({ origen })}
        />
        <SelectorFiltroMedioPago
          idPrefijo="busqueda-venta"
          medioPago={filtros.medioPago}
          medios={opciones.mediosPago}
          permiteMixto
          onCambiarMedioPago={(medioPago) => onBuscarVenta({ medioPago })}
        />
      </div>

      {/* Solo cuando hay algo que limpiar */}
      {cantidadFiltros > 0 && (
        <Button type="button" variant="ghost" className="h-11 gap-1.5 self-start px-3" onClick={onLimpiarFiltros}>
          <FilterX />
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}
