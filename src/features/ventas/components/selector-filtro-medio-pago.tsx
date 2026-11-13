import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { FiltroMedioPago, MedioPagoFiltro } from '@/features/ventas/types/historial'

/** Props del filtro por medio de pago. */
interface SelectorFiltroMedioPagoProps {
  idPrefijo: string
  medioPago: FiltroMedioPago
  medios: MedioPagoFiltro[]
  /** Una venta puede pagarse con dos medios ("Mixto"); un cambio cobra su saldo con uno solo. */
  permiteMixto: boolean
  deshabilitado?: boolean
  /** Por que esta deshabilitado; se asocia al campo con aria-describedby. */
  textoAyuda?: string
  onCambiarMedioPago: (medioPago: FiltroMedioPago) => void
}

export function SelectorFiltroMedioPago({
  idPrefijo,
  medioPago,
  medios,
  permiteMixto,
  deshabilitado = false,
  textoAyuda,
  onCambiarMedioPago,
}: SelectorFiltroMedioPagoProps) {
  const idCampo = `${idPrefijo}-medio-pago`
  const idAyuda = `${idPrefijo}-ayuda-medio-pago`

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={idCampo} className="text-sm font-medium">
        Medio de pago
      </Label>
      <Select
        value={medioPago === null ? 'TODOS' : String(medioPago)}
        disabled={deshabilitado}
        onValueChange={(valor) =>
          onCambiarMedioPago(valor === 'TODOS' ? null : valor === 'MIXTO' ? 'MIXTO' : Number(valor))
        }
      >
        <SelectTrigger id={idCampo} aria-describedby={deshabilitado && textoAyuda ? idAyuda : undefined}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TODOS">Todos</SelectItem>
          {medios.map((medio) => (
            <SelectItem key={medio.idMedioPago} value={String(medio.idMedioPago)}>
              {medio.nombre}
            </SelectItem>
          ))}
          {permiteMixto && <SelectItem value="MIXTO">Mixto (más de un medio)</SelectItem>}
        </SelectContent>
      </Select>
      {deshabilitado && textoAyuda && (
        <p id={idAyuda} className="text-xs text-texto-suave">
          {textoAyuda}
        </p>
      )}
    </div>
  )
}
