import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import {
  CODIGO_MOTIVO_OTRO,
  LONGITUD_MAXIMA_DETALLE_MOTIVO,
  MOTIVOS_ANULACION,
  MOTIVOS_EDICION,
} from '@/features/ventas/config/motivos-venta'
import type { AccionVenta, CodigoMotivo } from '@/features/ventas/types/historial'

/** Props de la lista de motivos de una anulacion o una edicion. */
interface SelectorMotivoVentaProps {
  accion: AccionVenta
  /** null hasta que se elige uno: no hay opcion preseleccionada. */
  codigoMotivo: CodigoMotivo | null
  detalleMotivo: string
  /** Mientras se espera al servidor no se puede cambiar el motivo. */
  deshabilitado: boolean
  onSeleccionarMotivo: (codigoMotivo: CodigoMotivo) => void
  onCambiarDetalleMotivo: (detalleMotivo: string) => void
}

export function SelectorMotivoVenta({
  accion,
  codigoMotivo,
  detalleMotivo,
  deshabilitado,
  onSeleccionarMotivo,
  onCambiarDetalleMotivo,
}: SelectorMotivoVentaProps) {
  const opciones = accion === 'ANULAR' ? MOTIVOS_ANULACION : MOTIVOS_EDICION

  return (
    <div className="flex flex-col gap-2">
      <span id="titulo-motivo-venta" className="text-sm font-medium">
        Motivo
      </span>

      {/* Opciones siempre visibles, de un solo toque; sin ninguna elegida de entrada */}
      <RadioGroup
        aria-labelledby="titulo-motivo-venta"
        value={codigoMotivo ?? ''}
        disabled={deshabilitado}
        onValueChange={(valor) => onSeleccionarMotivo(valor as CodigoMotivo)}
      >
        {opciones.map((opcion) => (
          <label
            key={opcion.codigo}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-grande border bg-fondo-tarjeta px-3 py-2 text-sm has-[[data-state=checked]]:border-texto-principal has-[[data-state=checked]]:bg-fondo-seleccion has-[button:disabled]:cursor-not-allowed"
          >
            <RadioGroupItem value={opcion.codigo} />
            <span>{opcion.etiqueta}</span>
          </label>
        ))}
      </RadioGroup>

      {/* --- DETALLE: SOLO CON "OTRO" --- */}
      {codigoMotivo === CODIGO_MOTIVO_OTRO && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="detalle-motivo-venta" className="sr-only">
            Detalle del motivo
          </Label>
          <Textarea
            id="detalle-motivo-venta"
            autoFocus
            rows={3}
            maxLength={LONGITUD_MAXIMA_DETALLE_MOTIVO}
            placeholder="Contá brevemente qué pasó"
            disabled={deshabilitado}
            aria-describedby="contador-detalle-motivo"
            value={detalleMotivo}
            onChange={(evento) => onCambiarDetalleMotivo(evento.target.value)}
          />
          <p
            id="contador-detalle-motivo"
            className="text-right text-xs text-texto-suave tabular-nums"
          >
            {detalleMotivo.length}/{LONGITUD_MAXIMA_DETALLE_MOTIVO}
          </p>
        </div>
      )}
    </div>
  )
}
