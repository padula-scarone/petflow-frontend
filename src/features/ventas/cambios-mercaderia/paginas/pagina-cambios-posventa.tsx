import { CambiosPosventa } from '@/features/ventas/cambios-mercaderia/components/cambios-posventa'
import { useCambiosPosventaEjemplo } from '@/features/ventas/cambios-mercaderia/hooks/use-cambios-posventa-ejemplo'
import { ContenedorAltaCambio } from '@/features/ventas/cambios-mercaderia/paginas/contenedor-alta-cambio'

/** Ruta de Ventas > Cambios posventa: conecta los hooks con la vista de la lista y el modal de alta. */
export function PaginaCambiosPosventa() {
  const { propiedadesCambios, alta, ventas, cambios, cerrarAlta, registrarCambio, verDetalle } =
    useCambiosPosventaEjemplo()

  return (
    <>
      <CambiosPosventa {...propiedadesCambios} />
      {alta && (
        <ContenedorAltaCambio
          key={alta.clave}
          ventas={ventas}
          cambios={cambios}
          borradorInicial={alta.borradorInicial}
          onCambioRegistrado={registrarCambio}
          onVerDetalleCambio={verDetalle}
          onCerrar={cerrarAlta}
        />
      )}
    </>
  )
}
