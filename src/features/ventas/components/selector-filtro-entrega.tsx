import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { ModalidadEntrega } from '@/features/ventas/types/historial'

const CLASE_OPCION = 'h-control rounded-mediano border border-borde-campo bg-fondo-tarjeta px-2 text-cuerpo'

/** Props del filtro por modalidad de entrega de la venta. */
interface SelectorFiltroEntregaProps {
  /** Prefijo de ids: la barra y la hoja pueden coexistir en el DOM. */
  idPrefijo: string
  modalidadEntrega: ModalidadEntrega | null
  onCambiarModalidadEntrega: (modalidadEntrega: ModalidadEntrega | null) => void
}

/** Entrega de la venta: Todos, Retiro o Envío. Lleva su propia etiqueta. */
export function SelectorFiltroEntrega({
  idPrefijo,
  modalidadEntrega,
  onCambiarModalidadEntrega,
}: SelectorFiltroEntregaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span id={`${idPrefijo}-entrega`} className="text-cuerpo font-medium">
        Entrega
      </span>
      <ToggleGroup
        type="single"
        spacing={2}
        aria-labelledby={`${idPrefijo}-entrega`}
        className="grid w-full grid-cols-3"
        value={modalidadEntrega ?? 'TODOS'}
        // Radix emite '' al des-seleccionar: se ignora, siempre hay una opcion elegida
        onValueChange={(valor) => {
          if (valor) onCambiarModalidadEntrega(valor === 'TODOS' ? null : (valor as ModalidadEntrega))
        }}
      >
        <ToggleGroupItem value="TODOS" className={CLASE_OPCION}>
          Todos
        </ToggleGroupItem>
        <ToggleGroupItem value="RETIRO" className={CLASE_OPCION}>
          Retiro
        </ToggleGroupItem>
        <ToggleGroupItem value="ENVIO" className={CLASE_OPCION}>
          Envío
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}
