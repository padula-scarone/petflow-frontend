import type { FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatearMoneda } from '@/lib/formatear-moneda'
import type {
  DatosDescuentoManual,
  DescuentoManual,
  TipoDescuentoManual,
} from '@/features/ventas/types/cobro'

/** Props de la tarjeta del descuento manual. */
interface TarjetaDescuentoManualProps {
  descuentoManual: DescuentoManual | null
  formularioAbierto: boolean
  /** Mensaje de validacion devuelto por el hook. */
  error?: string
  onAbrirFormulario: () => void
  onCerrarFormulario: () => void
  onAplicar: (datos: DatosDescuentoManual) => void
  onQuitar: () => void
}

const OPCIONES_TIPO: { valor: TipoDescuentoManual; etiqueta: string }[] = [
  { valor: 'porcentaje', etiqueta: '%' },
  { valor: 'monto', etiqueta: '$' },
]

export function TarjetaDescuentoManual({
  descuentoManual,
  formularioAbierto,
  error,
  onAbrirFormulario,
  onCerrarFormulario,
  onAplicar,
  onQuitar,
}: TarjetaDescuentoManualProps) {
  // El formulario no es controlado: se leen los campos recien al enviarlo
  const enviarFormulario = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    onAplicar({
      motivo: String(datos.get('motivo')).trim(),
      tipo: datos.get('tipo') as TipoDescuentoManual,
      valor: Number(datos.get('valor')),
    })
  }

  return (
    <Card className="gap-4 p-4 shadow-none">
      {/* --- ENCABEZADO --- */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold">Descuento</h2>
        {!descuentoManual && !formularioAbierto && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Agregar descuento manual"
            className="size-11 rounded-full bg-fondo-tarjeta"
            onClick={onAbrirFormulario}
          >
            <Plus />
          </Button>
        )}
      </div>

      {/* --- FORMULARIO (ALTA Y EDICION) --- */}
      {formularioAbierto && (
        <form className="flex flex-col gap-4" onSubmit={enviarFormulario}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="motivo-descuento" className="text-sm text-texto-suave">
              Motivo
            </Label>
            <Input
              id="motivo-descuento"
              name="motivo"
              required
              maxLength={60}
              autoComplete="off"
              placeholder="Ej: promo día de la mascota"
              defaultValue={descuentoManual?.motivo}
              className="h-11 bg-fondo-tarjeta"
            />
          </div>

          <div className="grid grid-cols-[auto_1fr] items-end gap-3">
            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1.5 text-sm text-texto-suave">Tipo</legend>
              <div className="flex rounded-grande border bg-fondo-tarjeta">
                {OPCIONES_TIPO.map((opcion) => (
                  <label
                    key={opcion.valor}
                    className="flex h-11 min-w-12 cursor-pointer items-center justify-center px-4 text-sm font-medium first:rounded-l-grande last:rounded-r-grande hover:bg-fondo-hover has-[:checked]:bg-fondo-seleccion has-[:checked]:hover:bg-fondo-seleccion has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-foco/50"
                  >
                    <input
                      type="radio"
                      name="tipo"
                      value={opcion.valor}
                      defaultChecked={(descuentoManual?.tipo ?? 'porcentaje') === opcion.valor}
                      className="sr-only"
                    />
                    {opcion.etiqueta}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="valor-descuento" className="text-sm text-texto-suave">
                Valor
              </Label>
              <Input
                id="valor-descuento"
                name="valor"
                required
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                defaultValue={descuentoManual?.valor}
                className="h-11 bg-fondo-tarjeta tabular-nums"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-peligro">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 bg-fondo-tarjeta px-6"
              onClick={onCerrarFormulario}
            >
              Cancelar
            </Button>
            <Button type="submit" className="h-11 px-6">
              Aplicar descuento
            </Button>
          </div>
        </form>
      )}

      {/* --- DESCUENTO APLICADO --- */}
      {descuentoManual && !formularioAbierto && (
        <div className="flex items-center gap-3 rounded-grande border p-3">
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 font-bold">{descuentoManual.motivo}</p>
            <p className="text-sm text-texto-suave tabular-nums">
              {descuentoManual.tipo === 'porcentaje'
                ? `${descuentoManual.valor} % de descuento`
                : `${formatearMoneda(descuentoManual.valor)} de descuento`}
              {' · '}
              <span className="font-medium whitespace-nowrap text-texto-principal">
                −&nbsp;{formatearMoneda(descuentoManual.montoDescontado)}
              </span>
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Editar descuento"
            className="size-11 shrink-0 text-slate-500"
            onClick={onAbrirFormulario}
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Quitar descuento"
            className="size-11 shrink-0 text-slate-500"
            onClick={onQuitar}
          >
            <Trash2 />
          </Button>
        </div>
      )}

      {!descuentoManual && !formularioAbierto && (
        <p className="text-sm text-texto-suave">Sin descuento manual aplicado.</p>
      )}
    </Card>
  )
}
