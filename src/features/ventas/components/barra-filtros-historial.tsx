import { Input } from '@/components/ui/input'
import { BarraFiltros } from '@/features/ventas/components/barra-filtros'
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
 * Fecha, producto y estado (los del SSOT), el cliente cuando el estado es "Pendiente de pago", y
 * "Mas filtros". Arma los controles; la fila y el popover son de BarraFiltros.
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
    <BarraFiltros
      cantidadFiltrosAdicionales={cantidadFiltrosAdicionales}
      contenidoAdicional={
        <FiltrosAdicionalesHistorial propiedades={propiedades} idPrefijo="barra-adicionales" />
      }
    >
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
    </BarraFiltros>
  )
}
