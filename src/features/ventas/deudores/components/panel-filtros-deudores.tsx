import { HojaFiltros } from '@/features/ventas/components/hoja-filtros'
import { PanelFiltros } from '@/features/ventas/components/panel-filtros'
import { CampoBusquedaDeudores } from '@/features/ventas/deudores/components/campo-busqueda-deudores'
import { FiltroProximoPago } from '@/features/ventas/deudores/components/filtro-proximo-pago'
import { SelectorOrdenDeudores } from '@/features/ventas/deudores/components/selector-orden-deudores'
import type { ListaDeudoresProps } from '@/features/ventas/deudores/types/cuenta-corriente'

/** Props del panel con el buscador, el filtro por proximo pago y el orden. */
interface PanelFiltrosDeudoresProps
  extends Pick<
    ListaDeudoresProps,
    | 'filtros'
    | 'onCambiarBusqueda'
    | 'onCambiarProximoPago'
    | 'onCambiarOrden'
    | 'onInvertirSentido'
    | 'onLimpiarFiltros'
  > {
  /** Total de la ultima consulta, para el boton "Ver n deudores" de la hoja; null mientras carga. */
  totalResultados: number | null
}

/**
 * Misma estructura que Historial y Devoluciones, en una sola fila. Escritorio: buscador, proximo pago y orden.
 * Mobile: el buscador y el boton de filtros, que abre desde abajo una hoja con proximo pago y orden. No hay alta de
 * deudores: un deudor nace al fiarle una venta en Registrar Venta. Quien ya no debe nada sale de la lista y solo
 * aparece al buscarlo.
 */
export function PanelFiltrosDeudores({
  filtros,
  totalResultados,
  onCambiarBusqueda,
  onCambiarProximoPago,
  onCambiarOrden,
  onInvertirSentido,
  onLimpiarFiltros,
}: PanelFiltrosDeudoresProps) {
  // La insignia cuenta lo que hay dentro de la hoja: el buscador esta siempre a la vista y el orden no es un filtro
  const cantidadFiltrosEnHoja = filtros.proximoPago === null ? 0 : 1

  return (
    <PanelFiltros
      busquedaMobile={
        <CampoBusquedaDeudores
          idCampo="movil-deudores-busqueda"
          busqueda={filtros.busqueda}
          onCambiarBusqueda={onCambiarBusqueda}
        />
      }
      barra={
        <div className="flex items-center gap-interno">
          <div className="min-w-0 flex-1">
            <CampoBusquedaDeudores
              idCampo="barra-deudores-busqueda"
              busqueda={filtros.busqueda}
              onCambiarBusqueda={onCambiarBusqueda}
            />
          </div>
          <div className="w-48">
            <FiltroProximoPago
              idCampo="barra-deudores-proximo-pago"
              variante="barra"
              proximoPago={filtros.proximoPago}
              onCambiarProximoPago={onCambiarProximoPago}
            />
          </div>
          <SelectorOrdenDeudores
            idCampo="barra-deudores-orden"
            variante="barra"
            ordenarPor={filtros.ordenarPor}
            sentido={filtros.sentido}
            onCambiarOrden={onCambiarOrden}
            onInvertirSentido={onInvertirSentido}
          />
        </div>
      }
      hoja={
        <HojaFiltros
          cantidadFiltrosActivos={cantidadFiltrosEnHoja}
          totalResultados={totalResultados}
          sustantivoSingular="deudor"
          sustantivoPlural="deudores"
          onLimpiarFiltros={onLimpiarFiltros}
        >
          <FiltroProximoPago
            idCampo="hoja-deudores-proximo-pago"
            variante="hoja"
            proximoPago={filtros.proximoPago}
            onCambiarProximoPago={onCambiarProximoPago}
          />
          <SelectorOrdenDeudores
            idCampo="hoja-deudores-orden"
            variante="hoja"
            ordenarPor={filtros.ordenarPor}
            sentido={filtros.sentido}
            onCambiarOrden={onCambiarOrden}
            onInvertirSentido={onInvertirSentido}
          />
        </HojaFiltros>
      }
    />
  )
}
