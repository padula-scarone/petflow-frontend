import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import {
  CODIGO_MOTIVO_OTRO,
  LONGITUD_MAXIMA_DETALLE_MOTIVO,
} from '@/features/ventas/config/motivos-venta'

/** Una opcion de la lista de motivos. */
export interface OpcionSelectorMotivo {
  codigo: string
  etiqueta: string
}

/** Props de la lista de motivos de una anulacion, una edicion o un cambio. */
interface SelectorMotivoProps {
  opciones: OpcionSelectorMotivo[]
  /** null hasta que se elige uno: no hay opcion preseleccionada. */
  codigoMotivo: string | null
  detalleMotivo: string
  /** Mientras se espera al servidor no se puede cambiar el motivo. */
  deshabilitado: boolean
  /** Distingue los ids si hay mas de un selector en pantalla. */
  idPrefijo: string
  onSeleccionarMotivo: (codigoMotivo: string) => void
  onCambiarDetalleMotivo: (detalleMotivo: string) => void
}

export function SelectorMotivo({
  opciones,
  codigoMotivo,
  detalleMotivo,
  deshabilitado,
  idPrefijo,
  onSeleccionarMotivo,
  onCambiarDetalleMotivo,
}: SelectorMotivoProps) {
  const idTitulo = `${idPrefijo}-titulo`
  const idDetalle = `${idPrefijo}-detalle`
  const idContador = `${idPrefijo}-contador`

  return (
    <div className="flex flex-col gap-2">
      <span id={idTitulo} className="text-sm font-medium">
        Motivo
      </span>

      {/* Opciones siempre visibles, de un solo toque; sin ninguna elegida de entrada */}
      <RadioGroup
        aria-labelledby={idTitulo}
        value={codigoMotivo ?? ''}
        disabled={deshabilitado}
        onValueChange={onSeleccionarMotivo}
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
          <Label htmlFor={idDetalle} className="sr-only">
            Detalle del motivo
          </Label>
          <Textarea
            id={idDetalle}
            autoFocus
            rows={3}
            maxLength={LONGITUD_MAXIMA_DETALLE_MOTIVO}
            placeholder="Contá brevemente qué pasó"
            disabled={deshabilitado}
            aria-describedby={idContador}
            value={detalleMotivo}
            onChange={(evento) => onCambiarDetalleMotivo(evento.target.value)}
          />
          <p id={idContador} className="text-right text-xs text-texto-suave tabular-nums">
            {detalleMotivo.length}/{LONGITUD_MAXIMA_DETALLE_MOTIVO}
          </p>
        </div>
      )}
    </div>
  )
}
