import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const CANTIDAD_ESQUELETOS = 6

/** Marcador de posicion mientras se consulta el historial: tarjetas hasta xl y filas desde xl. */
export function EstadoCargandoHistorial() {
  return (
    <div role="status" aria-busy="true" className="flex flex-col gap-3">
      <span className="sr-only">Cargando ventas</span>

      {/* --- TARJETAS --- */}
      <ul className="grid gap-3 md:grid-cols-2 xl:hidden">
        {Array.from({ length: CANTIDAD_ESQUELETOS }, (_, indice) => (
          <li key={indice}>
            <Card className="gap-3 p-4 shadow-none">
              <div className="flex justify-between gap-3">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-7 w-28 rounded-full" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-11 w-full" />
            </Card>
          </li>
        ))}
      </ul>

      {/* --- FILAS --- */}
      <Card className="hidden gap-0 p-0 shadow-none xl:flex">
        {Array.from({ length: CANTIDAD_ESQUELETOS }, (_, indice) => (
          <div key={indice} className="flex items-center gap-6 border-b px-3 py-4 last:border-b-0">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-7 w-32 rounded-full" />
            <Skeleton className="ml-auto h-6 w-24" />
            <Skeleton className="h-11 w-44" />
          </div>
        ))}
      </Card>
    </div>
  )
}
