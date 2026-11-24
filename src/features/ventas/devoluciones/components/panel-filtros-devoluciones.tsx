import { BotonCargarNuevaDevolucion } from '@/features/ventas/devoluciones/components/boton-cargar-nueva-devolucion'
import { FiltrosAdicionalesDevoluciones } from '@/features/ventas/devoluciones/components/filtros-adicionales-devoluciones'
import { FiltroEstadoDevolucion } from '@/features/ventas/devoluciones/components/filtros-selectores-devoluciones'
import type { PropiedadesFiltrosDevoluciones } from '@/features/ventas/devoluciones/types/devolucion'
import { BarraFiltros } from '@/features/ventas/components/barra-filtros'
import { FiltroProducto } from '@/features/ventas/components/filtro-producto'
import { FiltroRangoFechas } from '@/features/ventas/components/filtro-rango-fechas'
import { HojaFiltros } from '@/features/ventas/components/hoja-filtros'
import { PanelFiltros } from '@/features/ventas/components/panel-filtros'

/** Props del panel de filtros de la lista de devoluciones. */
interface PanelFiltrosDevolucionesProps {
  propiedades: PropiedadesFiltrosDevoluciones
  onCargarNuevaDevolucion: () => void
}

/**
 * Producto, fecha y estado a la vista; vinculo y medio de pago en "Mas filtros". El boton "Cargar nueva devolución"
 * comparte la fila con los filtros, en escritorio y en mobile, donde el buscador de producto esta siempre a la vista.
 */
export function PanelFiltrosDevoluciones({ propiedades, onCargarNuevaDevolucion }: PanelFiltrosDevolucionesProps) {
  const {
    filtros,
    opciones,
    cantidadFiltrosAdicionales,
    cantidadFiltrosEnHoja,
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
      accionEscritorio={
        <BotonCargarNuevaDevolucion variante="escritorio" onCargarNuevaDevolucion={onCargarNuevaDevolucion} />
      }
      accionMobile={<BotonCargarNuevaDevolucion variante="mobile" onCargarNuevaDevolucion={onCargarNuevaDevolucion} />}
      // --- MOBILE: EL BUSCADOR DE PRODUCTO, SIEMPRE A LA VISTA ---
      busquedaMobile={
        <FiltroProducto
          idCampo="movil-devoluciones-producto"
          variante="barra"
          productoSeleccionado={filtros.productoSeleccionado}
          textoBusqueda={opciones.textoBusquedaProducto}
          productosCoincidentes={opciones.productosCoincidentes}
          onBuscarProducto={onBuscarProducto}
          onSeleccionarProducto={onSeleccionarProducto}
        />
      }
      // --- ESCRITORIO: UNA FILA ---
      barra={
        <BarraFiltros
          cantidadFiltrosAdicionales={cantidadFiltrosAdicionales}
          contenidoAdicional={<FiltrosAdicionalesDevoluciones propiedades={propiedades} idPrefijo="barra-adicionales-devoluciones" />}
        >
          <FiltroProducto
            idCampo="barra-devoluciones-producto"
            variante="barra"
            productoSeleccionado={filtros.productoSeleccionado}
            textoBusqueda={opciones.textoBusquedaProducto}
            productosCoincidentes={opciones.productosCoincidentes}
            onBuscarProducto={onBuscarProducto}
            onSeleccionarProducto={onSeleccionarProducto}
          />
          <FiltroRangoFechas
            idCampo="barra-devoluciones-fecha"
            variante="barra"
            fechaDesde={filtros.fechaDesde}
            fechaHasta={filtros.fechaHasta}
            periodoRapidoActivo={periodoRapidoActivo}
            onCambiarFiltros={onCambiarFiltros}
            onSeleccionarPeriodoRapido={onSeleccionarPeriodoRapido}
          />
          <FiltroEstadoDevolucion
            idCampo="barra-devoluciones-estado"
            variante="barra"
            estado={filtros.estado}
            onCambiarEstado={(estado) => onCambiarFiltros({ estado })}
          />
        </BarraFiltros>
      }
      // --- MOBILE: HOJA CON LOS FILTROS QUE NO ESTAN A LA VISTA ---
      hoja={
        <HojaFiltros
          cantidadFiltrosActivos={cantidadFiltrosEnHoja}
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
