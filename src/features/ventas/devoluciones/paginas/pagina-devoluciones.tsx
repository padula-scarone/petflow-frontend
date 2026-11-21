import { Devoluciones } from '@/features/ventas/devoluciones/components/devoluciones'
import { useDevoluciones } from '@/features/ventas/devoluciones/hooks/use-devoluciones'
import { ContenedorAltaDevolucion } from '@/features/ventas/devoluciones/paginas/contenedor-alta-devolucion'

/** Ruta de Ventas > Devoluciones: conecta los hooks con la vista de la lista y el modal de alta. */
export function PaginaDevoluciones() {
  const { propiedadesDevoluciones: propiedadesDevoluciones, alta, desfaseServidorMilisegundos, cerrarAlta, registrarDevolucion: registrarDevolucion, refrescarLista, verDetalle } =
    useDevoluciones()

  return (
    <>
      <Devoluciones {...propiedadesDevoluciones} />
      {alta && (
        <ContenedorAltaDevolucion
          key={alta.clave}
          altaRepoblada={alta.altaRepoblada}
          desfaseServidorMilisegundos={desfaseServidorMilisegundos}
          onDevolucionRegistrada={registrarDevolucion}
          onVerDetalleDevolucion={verDetalle}
          onActualizarLista={refrescarLista}
          onCerrar={cerrarAlta}
        />
      )}
    </>
  )
}
