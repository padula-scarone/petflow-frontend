import { Input } from '@/components/ui/input'
import { BarraFiltros } from '@/features/ventas/components/barra-filtros'
import { CampoFiltroComprobante } from '@/features/ventas/components/campo-filtro-comprobante'
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
 * N.º de comprobante, producto, fecha y estado (los del SSOT), el deudor cuando el estado es "Pendiente de pago", y
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
      <CampoFiltroComprobante
        idCampo="barra-comprobante"
        numeroComprobante={filtros.numeroComprobante}
        onCambiarNumeroComprobante={(numeroComprobante) => onCambiarFiltros({ numeroComprobante })}
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
      <FiltroRangoFechas
        idCampo="barra-fecha"
        variante="barra"
        fechaDesde={filtros.fechaDesde}
        fechaHasta={filtros.fechaHasta}
        periodoRapidoActivo={periodoRapidoActivo}
        onCambiarFiltros={onCambiarFiltros}
        onSeleccionarPeriodoRapido={onSeleccionarPeriodoRapido}
      />
      <FiltroEstado
        idCampo="barra-estado"
        variante="barra"
        estado={filtros.estado}
        onCambiarEstado={(estado) => onCambiarFiltros({ estado })}
      />

      {/* --- DEUDOR: SOLO CON "PENDIENTE DE PAGO" --- */}
      {filtros.estado === 'PENDIENTE_PAGO' && (
        <Input
          type="text"
          autoComplete="off"
          placeholder="Buscar deudor"
          aria-label="Deudor"
          className="bg-fondo-tarjeta"
          value={filtros.textoCliente}
          onChange={(evento) => onCambiarFiltros({ textoCliente: evento.target.value })}
        />
      )}
    </BarraFiltros>
  )
}
