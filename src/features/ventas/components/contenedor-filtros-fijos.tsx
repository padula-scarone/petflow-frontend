import type { ReactNode } from 'react'

/** Props del contenedor de la fila de filtros que queda fija arriba. */
interface ContenedorFiltrosFijosProps {
  children: ReactNode
}

/**
 * La fila de filtros de Historial, Devoluciones y Deudores: queda fija arriba al hacer scroll. Los margenes negativos
 * cubren el padding del area con scroll, asi la lista no se ve pasar por encima. El top negativo compensa ese mismo
 * padding: sticky se mide desde el borde interno, no desde el borde real.
 * En mobile el top suma el alto de la cabecera mientras esta visible (--alto-cabecera, que define el layout), asi la
 * barra queda debajo de ella cuando reaparece y sube a 0 cuando se oculta. Queda metida bajo el aire inferior de la
 * cabecera (su margen negativo), asi la separacion con las pestanas sigue siendo un contorno: por eso el top resta un
 * contorno mas, sin pasar de 0 cuando la cabecera se oculta, ahi la barra pega al borde con su propio relleno.
 */
export function ContenedorFiltrosFijos({ children }: ContenedorFiltrosFijosProps) {
  return (
    <div className="sticky top-[max(calc(var(--spacing-contorno)*-1),calc(var(--alto-cabecera,0px)-var(--spacing-contorno)*2))] z-20 -mx-contorno -mt-contorno bg-fondo-pagina px-contorno pt-contorno pb-interno transition-[top] duration-200 motion-reduce:transition-none">
      {children}
    </div>
  )
}
