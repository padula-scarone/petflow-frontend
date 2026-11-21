import { useState, type FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatearMoneda } from '@/lib/formatear-moneda'
import { SelectorMotivo } from '@/features/ventas/components/selector-motivo'
import { CODIGO_MOTIVO_OTRO } from '@/features/ventas/config/motivos-venta'
import { ETIQUETA_POR_MOTIVO_DESCUENTO, MOTIVOS_DESCUENTO } from '@/features/ventas/config/motivos-descuento'
import { construirTextoMotivoConEtiquetas } from '@/features/ventas/utils/construir-texto-motivo'
import { inferirMotivoDeLista } from '@/features/ventas/utils/inferir-motivo'
import { esMotivoValido } from '@/features/ventas/utils/motivos-venta'
import { formatearMontoParaCampo } from '@/features/ventas/utils/texto-monto'
import type {
  CodigoMotivoDescuento,
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

/** Props del formulario de alta y edicion del descuento. */
interface FormularioDescuentoManualProps {
  descuentoManual: DescuentoManual | null
  /** Mensaje de validacion devuelto por el hook. */
  error?: string
  onCerrar: () => void
  onAplicar: (datos: DatosDescuentoManual) => void
}

/**
 * Formulario del descuento. Se monta al abrirse, asi el motivo arranca vacio en un alta y precargado al editar.
 * El motivo se elige de una lista fija; al hook le llega el texto: la etiqueta elegida o, con "Otro", el detalle.
 */
function FormularioDescuentoManual({ descuentoManual, error, onCerrar, onAplicar }: FormularioDescuentoManualProps) {
  const [motivo, setMotivo] = useState(() => inferirMotivoDeLista(descuentoManual?.motivo ?? null, MOTIVOS_DESCUENTO))
  const [errorMotivo, setErrorMotivo] = useState<string>()

  // Motivo y detalle son controlados; tipo y valor no: se leen recien al enviar
  const enviarFormulario = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    if (!esMotivoValido(motivo.codigoMotivo, motivo.detalleMotivo) || motivo.codigoMotivo === null) {
      setErrorMotivo(
        motivo.codigoMotivo === null ? 'Elegí el motivo del descuento' : 'Escribí el detalle del motivo',
      )
      return
    }
    const datos = new FormData(evento.currentTarget)
    onAplicar({
      motivo: construirTextoMotivoConEtiquetas(
        motivo.codigoMotivo,
        motivo.detalleMotivo,
        ETIQUETA_POR_MOTIVO_DESCUENTO,
      ),
      tipo: datos.get('tipo') as TipoDescuentoManual,
      // Sin decimales se entiende ",00"; se acepta coma o punto como separador
      valor: Number(String(datos.get('valor')).replace(',', '.')),
    })
  }

  const seleccionarMotivo = (codigoMotivo: string) => {
    setErrorMotivo(undefined)
    setMotivo((actual) => ({
      codigoMotivo: codigoMotivo as CodigoMotivoDescuento,
      // El detalle solo existe con "Otro": al elegir otro motivo se descarta lo escrito
      detalleMotivo: codigoMotivo === CODIGO_MOTIVO_OTRO ? actual.detalleMotivo : '',
    }))
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={enviarFormulario}>
      <SelectorMotivo
        idPrefijo="motivo-descuento"
        opciones={MOTIVOS_DESCUENTO}
        codigoMotivo={motivo.codigoMotivo}
        detalleMotivo={motivo.detalleMotivo}
        deshabilitado={false}
        placeholderDetalle="Contá brevemente por qué se hace el descuento"
        onSeleccionarMotivo={seleccionarMotivo}
        onCambiarDetalleMotivo={(detalleMotivo) => {
          setErrorMotivo(undefined)
          setMotivo((actual) => ({ ...actual, detalleMotivo }))
        }}
      />

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
            inputMode="decimal"
            pattern="[0-9]+([,.][0-9]{1,2})?"
            title="Ingresá un número, con hasta 2 decimales (por ejemplo 1500 o 1500,50)"
            autoComplete="off"
            defaultValue={
              descuentoManual?.tipo === 'monto'
                ? formatearMontoParaCampo(descuentoManual.valor)
                : descuentoManual?.valor.toString().replace('.', ',')
            }
            className="h-11 bg-fondo-tarjeta tabular-nums"
          />
        </div>
      </div>

      {(errorMotivo ?? error) && (
        <p role="alert" className="text-sm font-medium text-peligro">
          {errorMotivo ?? error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" className="h-11 bg-fondo-tarjeta px-6" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button type="submit" className="h-11 px-6">
          Aplicar descuento
        </Button>
      </div>
    </form>
  )
}

export function TarjetaDescuentoManual({
  descuentoManual,
  formularioAbierto,
  error,
  onAbrirFormulario,
  onCerrarFormulario,
  onAplicar,
  onQuitar,
}: TarjetaDescuentoManualProps) {
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
        <FormularioDescuentoManual
          descuentoManual={descuentoManual}
          error={error}
          onCerrar={onCerrarFormulario}
          onAplicar={onAplicar}
        />
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
