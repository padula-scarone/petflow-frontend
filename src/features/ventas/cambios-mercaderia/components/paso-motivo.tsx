import { MOTIVOS_CAMBIO } from '@/features/ventas/cambios-mercaderia/config/motivos-cambio'
import type { AltaCambioProps } from '@/features/ventas/cambios-mercaderia/types/cambio'
import { SelectorMotivo } from '@/features/ventas/components/selector-motivo'

/** Props del paso "Motivo". */
type PasoMotivoProps = Pick<AltaCambioProps, 'borrador' | 'acciones'>

/**
 * Paso 1: por que el cliente viene a cambiar. Es obligatorio en todo cambio, vinculado o no, y va primero
 * porque es lo primero que cuenta el cliente. "Otro" exige un detalle escrito.
 */
export function PasoMotivo({ borrador, acciones }: PasoMotivoProps) {
  return (
    <section aria-label="Motivo del cambio" className="flex flex-col gap-3">
      <p className="text-sm text-texto-suave">¿Por qué cambia el cliente?</p>
      <SelectorMotivo
        idPrefijo="motivo-cambio"
        opciones={MOTIVOS_CAMBIO}
        codigoMotivo={borrador.codigoMotivo}
        detalleMotivo={borrador.detalleMotivo}
        deshabilitado={false}
        onSeleccionarMotivo={acciones.onSeleccionarMotivo}
        onCambiarDetalleMotivo={acciones.onCambiarDetalleMotivo}
      />
    </section>
  )
}
