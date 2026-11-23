import { useNavigate } from 'react-router'
import { Deudores } from '@/features/ventas/deudores/components/deudores'
import { construirRutaFichaDeudor } from '@/features/ventas/deudores/config/rutas-deudores'
import { useListaDeudoresEjemplo } from '@/features/ventas/deudores/hooks/use-lista-deudores-ejemplo'

/** Ruta de Ventas > Deudores: conecta el hook con la vista. */
export function PaginaListaDeudores() {
  const lista = useListaDeudoresEjemplo()
  const navegar = useNavigate()

  return (
    <Deudores
      filtros={lista.filtros}
      estadoLista={lista.estadoLista}
      onCambiarBusqueda={lista.cambiarBusqueda}
      onCambiarProximoPago={lista.cambiarProximoPago}
      onCambiarOrden={lista.cambiarOrden}
      onInvertirSentido={lista.invertirSentido}
      onLimpiarFiltros={lista.limpiarFiltros}
      onCambiarPagina={lista.cambiarPagina}
      onAbrirFicha={(idDeudor) => void navegar(construirRutaFichaDeudor(idDeudor))}
      onReintentar={lista.reintentar}
    />
  )
}
