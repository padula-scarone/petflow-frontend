import { CambiosPosventa } from '@/features/ventas/cambios-mercaderia/components/cambios-posventa'
import { useCambiosPosventa } from '@/features/ventas/cambios-mercaderia/hooks/use-cambios-posventa'
import { ContenedorAltaCambio } from '@/features/ventas/cambios-mercaderia/paginas/contenedor-alta-cambio'

/** Ruta de Ventas > Cambios posventa: conecta los hooks con la vista de la lista y el modal de alta. */
export function PaginaCambiosPosventa() {
  const { propiedadesCambios, alta, desfaseServidorMilisegundos, cerrarAlta, registrarCambio, refrescarLista, verDetalle } =
    useCambiosPosventa()

  return (
    <>
      <CambiosPosventa {...propiedadesCambios} />
      {alta && (
        <ContenedorAltaCambio
          key={alta.clave}
          altaRepoblada={alta.altaRepoblada}
          desfaseServidorMilisegundos={desfaseServidorMilisegundos}
          onCambioRegistrado={registrarCambio}
          onVerDetalleCambio={verDetalle}
          onActualizarLista={refrescarLista}
          onCerrar={cerrarAlta}
        />
      )}
    </>
  )
}
