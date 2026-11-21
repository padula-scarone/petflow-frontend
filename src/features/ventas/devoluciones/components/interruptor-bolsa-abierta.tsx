import { Switch } from '@/components/ui/switch'
import type { OpcionBolsaAbierta } from '@/features/ventas/devoluciones/types/devolucion'

/** Props del interruptor "Bolsa abierta". */
interface InterruptorBolsaAbiertaProps {
  opcion: OpcionBolsaAbierta
  activado: boolean
  onCambiar: (esBolsaAbierta: boolean) => void
}

/**
 * Solo se muestra en productos con variante a granel. Desactivado se repone la unidad entera; activado el
 * contenido vuelve al stock a granel y se pide el peso real. Toda la fila es tocable (44 px de alto).
 */
export function InterruptorBolsaAbierta({ opcion, activado, onCambiar }: InterruptorBolsaAbiertaProps) {
  return (
    <label className="flex min-h-control cursor-pointer items-center justify-between gap-interno rounded-grande border border-borde-campo bg-fondo-tarjeta px-3 py-2 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-foco/50">
      <span className="flex min-w-0 flex-col">
        <span className="text-cuerpo font-medium">Bolsa abierta</span>
        <span id="descripcion-bolsa-abierta" className="text-auxiliar text-texto-suave">
          {activado
            ? `El contenido vuelve al stock a granel de «${opcion.nombreProductoGranel}».`
            : 'Cerrada: se repone la unidad entera.'}
        </span>
      </span>
      <Switch
        checked={activado}
        aria-describedby="descripcion-bolsa-abierta"
        onCheckedChange={onCambiar}
      />
    </label>
  )
}
