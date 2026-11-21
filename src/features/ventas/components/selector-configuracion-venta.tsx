import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type {
  CanalVenta,
  TipoEntrega,
} from '@/features/ventas/types/venta'

const CLASE_GRUPO = 'rounded-grande border border-borde-campo bg-fondo-tarjeta'
const CLASE_OPCION = 'flex-1 px-4 sm:flex-none sm:min-w-28'

/** Props del selector de canal de venta y tipo de entrega. */
interface SelectorConfiguracionVentaProps {
  canalVenta: CanalVenta
  tipoEntrega: TipoEntrega
  onCambiarCanal: (canalVenta: CanalVenta) => void
  onCambiarEntrega: (tipoEntrega: TipoEntrega) => void
}

export function SelectorConfiguracionVenta({
  canalVenta,
  tipoEntrega,
  onCambiarCanal,
  onCambiarEntrega,
}: SelectorConfiguracionVentaProps) {
  return (
    <div className="flex flex-col gap-bloque md:flex-row md:items-center">
      {/* --- CANAL --- */}
      <div className="flex flex-col gap-interno sm:flex-row sm:items-center">
        <span id="etiqueta-canal" className="text-cuerpo font-medium">
          Canal:
        </span>
        <ToggleGroup
          type="single"
          aria-labelledby="etiqueta-canal"
          className={`${CLASE_GRUPO} w-full sm:w-fit`}
          value={canalVenta}
          // Radix emite '' al des-seleccionar; el canal siempre debe tener valor
          onValueChange={(valor) => {
            if (valor) onCambiarCanal(valor as CanalVenta)
          }}
        >
          <ToggleGroupItem value="mostrador" className={CLASE_OPCION}>
            Mostrador
          </ToggleGroupItem>
          <ToggleGroupItem value="digital" className={CLASE_OPCION}>
            Digital
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* --- ENTREGA --- */}
      <div className="flex flex-col gap-interno sm:flex-row sm:items-center">
        <span id="etiqueta-entrega" className="text-cuerpo font-medium">
          Entrega:
        </span>
        <ToggleGroup
          type="single"
          aria-labelledby="etiqueta-entrega"
          className={`${CLASE_GRUPO} w-full sm:w-fit`}
          value={tipoEntrega}
          onValueChange={(valor) => {
            if (valor) onCambiarEntrega(valor as TipoEntrega)
          }}
        >
          <ToggleGroupItem value="retiro" className={CLASE_OPCION}>
            Retiro
          </ToggleGroupItem>
          <ToggleGroupItem value="envio" className={CLASE_OPCION}>
            Envío
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  )
}
