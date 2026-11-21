import { BotonCargarNuevaDevolucion } from '@/features/ventas/devoluciones/components/boton-cargar-nueva-devolucion'
import { FiltrosAdicionalesDevoluciones } from '@/features/ventas/devoluciones/components/filtros-adicionales-devoluciones'
import { FiltroEstadoDevolucion } from '@/features/ventas/devoluciones/components/filtros-selectores-devoluciones'
import type {
  EstadoListaDevoluciones,
  PropiedadesFiltrosDevoluciones,
} from '@/features/ventas/devoluciones/types/devolucion'
import { describirCantidadDevoluciones } from '@/features/ventas/devoluciones/utils/describir-resultados-devoluciones'
import { BarraFiltros } from '@/features/ventas/components/barra-filtros'
import { FiltroProducto } from '@/features/ventas/components/filtro-producto'
import { FiltroRangoFechas } from '@/features/ventas/components/filtro-rango-fechas'
import { HojaFiltros } from '@/features/ventas/components/hoja-filtros'
import { PanelFiltros } from '@/features/ventas/components/panel-filtros'

/** Props del panel de filtros de la lista de devoluciones. */
interface PanelFiltrosDevolucionesProps {
  propiedades: PropiedadesFiltrosDevoluciones
  /** Para el conteo de la fila fija de mobile. */
  estadoLista: EstadoListaDevoluciones
  onCargarNuevaDevolucion: () => void
}

/**
 * Fecha, producto (devuelto o entregado) y estado a la vista; vinculo y medio de pago en "Mas filtros".
 * El boton "Cargar nueva devolución" comparte la fila con los filtros, en escritorio y en mobile.
 */
export function PanelFiltrosDevoluciones({ propiedades, estadoLista, onCargarNuevaDevolucion }: PanelFiltrosDevolucionesProps) {
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
      textoCantidad={describirCantidadDevoluciones(estadoLista)}
      cantidadFiltrosActivos={cantidadFiltrosActivos}
      onLimpiarFiltros={onLimpiarFiltros}
      accionEscritorio={
        <BotonCargarNuevaDevolucion variante="escritorio" onCargarNuevaDevolucion={onCargarNuevaDevolucion} />
      }
      accionMobile={<BotonCargarNuevaDevolucion variante="mobile" onCargarNuevaDevolucion={onCargarNuevaDevolucion} />}
      // --- ESCRITORIO: UNA FILA ---
      barra={
        <BarraFiltros
          cantidadFiltrosAdicionales={cantidadFiltrosAdicionales}
          contenidoAdicional={<FiltrosAdicionalesDevoluciones propiedades={propiedades} idPrefijo="barra-adicionales-devoluciones" />}
        >
          <FiltroRangoFechas
            idCampo="barra-devoluciones-fecha"
            variante="barra"
            fechaDesde={filtros.fechaDesde}
            fechaHasta={filtros.fechaHasta}
            periodoRapidoActivo={periodoRapidoActivo}
            onCambiarFiltros={onCambiarFiltros}
            onSeleccionarPeriodoRapido={onSeleccionarPeriodoRapido}
          />
          <FiltroProducto
            idCampo="barra-devoluciones-producto"
            variante="barra"
            productoSeleccionado={filtros.productoSeleccionado}
            textoBusqueda={opciones.textoBusquedaProducto}
            productosCoincidentes={opciones.productosCoincidentes}
            onBuscarProducto={onBuscarProducto}
            onSeleccionarProducto={onSeleccionarProducto}
          />
          <FiltroEstadoDevolucion
            idCampo="barra-devoluciones-estado"
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
          sustantivoSingular="devolucion"
          sustantivoPlural="devoluciones"
          onLimpiarFiltros={onLimpiarFiltros}
        >
          <FiltroRangoFechas
            idCampo="hoja-devoluciones-fecha"
            variante="hoja"
            fechaDesde={filtros.fechaDesde}
            fechaHasta={filtros.fechaHasta}
            periodoRapidoActivo={periodoRapidoActivo}
            onCambiarFiltros={onCambiarFiltros}
            onSeleccionarPeriodoRapido={onSeleccionarPeriodoRapido}
          />
          <FiltroProducto
            idCampo="hoja-devoluciones-producto"
            variante="hoja"
            productoSeleccionado={filtros.productoSeleccionado}
            textoBusqueda={opciones.textoBusquedaProducto}
            productosCoincidentes={opciones.productosCoincidentes}
            onBuscarProducto={onBuscarProducto}
            onSeleccionarProducto={onSeleccionarProducto}
          />
          <FiltroEstadoDevolucion
            idCampo="hoja-devoluciones-estado"
            variante="hoja"
            estado={filtros.estado}
            onCambiarEstado={(estado) => onCambiarFiltros({ estado })}
          />
          <FiltrosAdicionalesDevoluciones propiedades={propiedades} idPrefijo="hoja-adicionales-devoluciones" />
        </HojaFiltros>
      }
    />
  )
}
