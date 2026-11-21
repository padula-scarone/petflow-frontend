import { MOTIVOS_DEVOLUCION } from '@/features/ventas/devoluciones/config/motivos-devolucion'
import type { AltaDevolucionProps } from '@/features/ventas/devoluciones/types/devolucion'
import { SelectorMotivo } from '@/features/ventas/components/selector-motivo'

/** Props del paso "Motivo". */
type PasoMotivoProps = Pick<AltaDevolucionProps, 'borrador' | 'acciones'>

/**
 * Paso 1: por que el cliente viene a cambiar. Es obligatorio en toda devolución, vinculado o no, y va primero
 * porque es lo primero que cuenta el cliente. "Otro" exige un detalle escrito.
 */
export function PasoMotivo({ borrador, acciones }: PasoMotivoProps) {
  return (
    <section aria-label="Motivo de la devolución" className="flex flex-col gap-interno">
      <p className="text-cuerpo text-texto-suave">¿Por qué cambia el cliente?</p>
      <SelectorMotivo
        idPrefijo="motivo-devolucion"
        opciones={MOTIVOS_DEVOLUCION}
        codigoMotivo={borrador.codigoMotivo}
        detalleMotivo={borrador.detalleMotivo}
        deshabilitado={false}
        onSeleccionarMotivo={acciones.onSeleccionarMotivo}
        onCambiarDetalleMotivo={acciones.onCambiarDetalleMotivo}
      />
    </section>
  )
}
