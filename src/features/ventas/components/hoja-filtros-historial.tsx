import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FiltroEstado } from '@/features/ventas/components/filtro-estado'
import { FiltroProducto } from '@/features/ventas/components/filtro-producto'
import { FiltroRangoFechas } from '@/features/ventas/components/filtro-rango-fechas'
import { FiltrosAdicionalesHistorial } from '@/features/ventas/components/filtros-adicionales-historial'
import { HojaFiltros } from '@/features/ventas/components/hoja-filtros'
import type { PropiedadesFiltrosHistorial } from '@/features/ventas/types/historial'

/** Props de la hoja de filtros de mobile. */
interface HojaFiltrosHistorialProps {
  propiedades: PropiedadesFiltrosHistorial
}

/** Mobile: todos los filtros del historial, cada uno con su etiqueta, dentro de la hoja generica. */
export function HojaFiltrosHistorial({ propiedades }: HojaFiltrosHistorialProps) {
  const {
    filtros,
    opciones,
    cantidadFiltrosActivos,
    periodoRapidoActivo,
    totalResultados,
    onCambiarFiltros,
    onSeleccionarPeriodoRapido,
    onBuscarProducto,
    onSeleccionarProducto,
    onLimpiarFiltros,
  } = propiedades

  return (
    <HojaFiltros
      cantidadFiltrosActivos={cantidadFiltrosActivos}
      totalResultados={totalResultados}
      sustantivoSingular="venta"
      sustantivoPlural="ventas"
      onLimpiarFiltros={onLimpiarFiltros}
    >
      <FiltroRangoFechas
        idCampo="hoja-fecha"
        variante="hoja"
        fechaDesde={filtros.fechaDesde}
        fechaHasta={filtros.fechaHasta}
        periodoRapidoActivo={periodoRapidoActivo}
        onCambiarFiltros={onCambiarFiltros}
        onSeleccionarPeriodoRapido={onSeleccionarPeriodoRapido}
      />
      <FiltroProducto
        idCampo="hoja-producto"
        variante="hoja"
        productoSeleccionado={filtros.productoSeleccionado}
        textoBusqueda={opciones.textoBusquedaProducto}
        productosCoincidentes={opciones.productosCoincidentes}
        onBuscarProducto={onBuscarProducto}
        onSeleccionarProducto={onSeleccionarProducto}
      />
      <FiltroEstado
        idCampo="hoja-estado"
        variante="hoja"
        estado={filtros.estado}
        onCambiarEstado={(estado) => onCambiarFiltros({ estado })}
      />
      {filtros.estado === 'PENDIENTE_PAGO' && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="hoja-cliente" className="text-sm font-medium">
            Cliente
          </Label>
          <Input
            id="hoja-cliente"
            type="text"
            autoComplete="off"
            placeholder="Buscar por nombre"
            className="h-11 bg-fondo-tarjeta"
            value={filtros.textoCliente}
            onChange={(evento) => onCambiarFiltros({ textoCliente: evento.target.value })}
          />
        </div>
      )}
      <FiltrosAdicionalesHistorial propiedades={propiedades} idPrefijo="hoja-adicionales" />
    </HojaFiltros>
  )
}
