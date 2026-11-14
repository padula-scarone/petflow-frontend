import { Skeleton } from '@/components/ui/skeleton'
import { EstadoErrorLista } from '@/features/ventas/components/estado-error-lista'
import type { EstadoCargaRecurso } from '@/features/ventas/types/carga'

/** Props del estado del catalogo que reemplaza al buscador mientras no esta listo. */
interface EstadoCatalogoProductosProps {
  estadoCatalogo: EstadoCargaRecurso
  onReintentar: () => void
}

export function EstadoCatalogoProductos({
  estadoCatalogo,
  onReintentar,
}: EstadoCatalogoProductosProps) {
  if (estadoCatalogo.fase === 'error') {
    return (
      <EstadoErrorLista
        titulo="No se pudieron cargar los productos"
        mensaje={estadoCatalogo.mensajeError ?? ''}
        onReintentar={onReintentar}
      />
    )
  }

  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Cargando productos</span>
      <Skeleton className="h-11 w-full" />
    </div>
  )
}
