import { useId } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { HojaFiltros } from '@/features/ventas/components/hoja-filtros'
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
 * Una sola fila, como en Historial y Devoluciones. Escritorio: buscador, proximo pago y orden. Celular: el buscador
 * y el boton "Filtros", que abre desde abajo una hoja con proximo pago y orden. No hay alta de deudores: un deudor
 * nace al fiarle una venta en Registrar Venta. Quien ya no debe nada sale de la lista y solo aparece al buscarlo.
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
  const idBusqueda = useId()
  // La insignia cuenta lo que hay dentro de la hoja: el buscador esta siempre a la vista y el orden no es un filtro
  const cantidadFiltrosActivos = filtros.proximoPago === null ? 0 : 1

  return (
    <div className="flex items-center gap-interno">
      {/* --- BUSCADOR --- */}
      <div className="relative min-w-0 flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-texto-suave"
        />
        <Input
          id={idBusqueda}
          type="text"
          autoComplete="off"
          aria-label="Buscar deudor por nombre o DNI"
          // Corto a proposito: en celular comparte la fila con el boton Filtros
          placeholder="Nombre o DNI"
          className="bg-fondo-tarjeta pl-10"
          value={filtros.busqueda}
          onChange={(evento) => onCambiarBusqueda(evento.target.value)}
          onKeyDown={(evento) => {
            if (evento.key === 'Escape' && filtros.busqueda !== '') {
              evento.stopPropagation()
              onCambiarBusqueda('')
            }
          }}
        />
      </div>

      {/* --- ESCRITORIO: PROXIMO PAGO Y ORDEN --- */}
      <div className="hidden items-center gap-interno lg:flex">
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

      {/* --- CELULAR: HOJA CON PROXIMO PAGO Y ORDEN --- */}
      <div className="lg:hidden">
        <HojaFiltros
          cantidadFiltrosActivos={cantidadFiltrosActivos}
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
      </div>
    </div>
  )
}
