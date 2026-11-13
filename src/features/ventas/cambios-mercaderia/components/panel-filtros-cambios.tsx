import { BotonCargarNuevoCambio } from '@/features/ventas/cambios-mercaderia/components/boton-cargar-nuevo-cambio'
import { FiltrosAdicionalesCambios } from '@/features/ventas/cambios-mercaderia/components/filtros-adicionales-cambios'
import { FiltroEstadoCambio } from '@/features/ventas/cambios-mercaderia/components/filtros-selectores-cambios'
import type {
  EstadoListaCambios,
  PropiedadesFiltrosCambios,
} from '@/features/ventas/cambios-mercaderia/types/cambio'
import { describirCantidadCambios } from '@/features/ventas/cambios-mercaderia/utils/describir-resultados-cambios'
import { BarraFiltros } from '@/features/ventas/components/barra-filtros'
import { FiltroProducto } from '@/features/ventas/components/filtro-producto'
import { FiltroRangoFechas } from '@/features/ventas/components/filtro-rango-fechas'
import { HojaFiltros } from '@/features/ventas/components/hoja-filtros'
import { PanelFiltros } from '@/features/ventas/components/panel-filtros'

/** Props del panel de filtros de la lista de cambios. */
interface PanelFiltrosCambiosProps {
  propiedades: PropiedadesFiltrosCambios
  /** Para el conteo de la fila fija de mobile. */
  estadoLista: EstadoListaCambios
  onCargarNuevoCambio: () => void
}

/**
 * Fecha, producto (devuelto o entregado) y estado a la vista; vinculo y medio de pago en "Mas filtros".
 * El boton "Cargar nuevo cambio" comparte la fila con los filtros, en escritorio y en mobile.
 */
export function PanelFiltrosCambios({ propiedades, estadoLista, onCargarNuevoCambio }: PanelFiltrosCambiosProps) {
  const {
    filtros,
    opciones,
    cantidadFiltrosActivos,
    cantidadFiltrosAdicionales,
    periodoRapidoActivo,
    totalResultados,
    onCambiarFiltros,
    onSeleccionarPeriodoRapido,
    onBuscarProducto,
    onSeleccionarProducto,
    onLimpiarFiltros,
  } = propiedades

  return (
    <PanelFiltros
      textoCantidad={describirCantidadCambios(estadoLista)}
      cantidadFiltrosActivos={cantidadFiltrosActivos}
      onLimpiarFiltros={onLimpiarFiltros}
      accionEscritorio={
        <BotonCargarNuevoCambio variante="escritorio" onCargarNuevoCambio={onCargarNuevoCambio} />
      }
      accionMobile={<BotonCargarNuevoCambio variante="mobile" onCargarNuevoCambio={onCargarNuevoCambio} />}
      // --- ESCRITORIO: UNA FILA ---
      barra={
        <BarraFiltros
          cantidadFiltrosAdicionales={cantidadFiltrosAdicionales}
          contenidoAdicional={<FiltrosAdicionalesCambios propiedades={propiedades} idPrefijo="barra-adicionales-cambios" />}
        >
          <FiltroRangoFechas
            idCampo="barra-cambios-fecha"
            variante="barra"
            fechaDesde={filtros.fechaDesde}
            fechaHasta={filtros.fechaHasta}
            periodoRapidoActivo={periodoRapidoActivo}
            onCambiarFiltros={onCambiarFiltros}
            onSeleccionarPeriodoRapido={onSeleccionarPeriodoRapido}
          />
          <FiltroProducto
            idCampo="barra-cambios-producto"
            variante="barra"
            productoSeleccionado={filtros.productoSeleccionado}
            textoBusqueda={opciones.textoBusquedaProducto}
            productosCoincidentes={opciones.productosCoincidentes}
            onBuscarProducto={onBuscarProducto}
            onSeleccionarProducto={onSeleccionarProducto}
          />
          <FiltroEstadoCambio
            idCampo="barra-cambios-estado"
            variante="barra"
            estado={filtros.estado}
            onCambiarEstado={(estado) => onCambiarFiltros({ estado })}
          />
        </BarraFiltros>
      }
      // --- MOBILE: HOJA CON TODOS LOS FILTROS ---
      hoja={
        <HojaFiltros
          cantidadFiltrosActivos={cantidadFiltrosActivos}
          totalResultados={totalResultados}
          sustantivoSingular="cambio"
          sustantivoPlural="cambios"
          onLimpiarFiltros={onLimpiarFiltros}
        >
          <FiltroRangoFechas
            idCampo="hoja-cambios-fecha"
            variante="hoja"
            fechaDesde={filtros.fechaDesde}
            fechaHasta={filtros.fechaHasta}
            periodoRapidoActivo={periodoRapidoActivo}
            onCambiarFiltros={onCambiarFiltros}
            onSeleccionarPeriodoRapido={onSeleccionarPeriodoRapido}
          />
          <FiltroProducto
            idCampo="hoja-cambios-producto"
            variante="hoja"
            productoSeleccionado={filtros.productoSeleccionado}
            textoBusqueda={opciones.textoBusquedaProducto}
            productosCoincidentes={opciones.productosCoincidentes}
            onBuscarProducto={onBuscarProducto}
            onSeleccionarProducto={onSeleccionarProducto}
          />
          <FiltroEstadoCambio
            idCampo="hoja-cambios-estado"
            variante="hoja"
            estado={filtros.estado}
            onCambiarEstado={(estado) => onCambiarFiltros({ estado })}
          />
          <FiltrosAdicionalesCambios propiedades={propiedades} idPrefijo="hoja-adicionales-cambios" />
        </HojaFiltros>
      }
    />
  )
}
