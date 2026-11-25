import type { FormEvent } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CampoDeudor, DatosDeudor, ErroresDatosDeudor } from '@/features/ventas/deudores/types/deudor'

/** Props del formulario de datos de un deudor. */
interface FormularioDeudorProps {
  /** Id del formulario: el boton de guardar del pie del dialogo lo envia con este id. */
  idFormulario: string
  valores: DatosDeudor
  errores: ErroresDatosDeudor
  deshabilitado: boolean
  onCambiarValor: (campo: CampoDeudor, valor: string) => void
  onSalirDelCampo: (campo: CampoDeudor) => void
  onEnviar: () => void
}

/** Props de un campo del formulario. */
interface CampoDatoDeudorProps {
  idFormulario: string
  campo: CampoDeudor
  etiqueta: string
  valor: string
  error?: string
  deshabilitado: boolean
  modoEntrada: 'text' | 'tel' | 'numeric'
  tipo: 'text' | 'tel'
  autoEnfocar?: boolean
  onCambiarValor: (campo: CampoDeudor, valor: string) => void
  onSalirDelCampo: (campo: CampoDeudor) => void
}

/** Un campo con su etiqueta y, si hace falta, su error: se anuncia al marcarse. Sin errores no lleva textos de ayuda. */
function CampoDatoDeudor({
  idFormulario,
  campo,
  etiqueta,
  valor,
  error,
  deshabilitado,
  modoEntrada,
  tipo,
  autoEnfocar = false,
  onCambiarValor,
  onSalirDelCampo,
}: CampoDatoDeudorProps) {
  const idCampo = `${idFormulario}-${campo}`
  const idMensaje = `${idCampo}-mensaje`

  return (
    <div className="flex flex-col gap-interno">
      <Label htmlFor={idCampo} className="text-cuerpo text-texto-suave">
        {etiqueta}
      </Label>
      <Input
        id={idCampo}
        type={tipo}
        inputMode={modoEntrada}
        autoComplete="off"
        autoFocus={autoEnfocar}
        disabled={deshabilitado}
        value={valor}
        aria-invalid={error !== undefined}
        aria-describedby={error !== undefined ? idMensaje : undefined}
        className="bg-fondo-tarjeta"
        onChange={(evento) => onCambiarValor(campo, evento.target.value)}
        onBlur={() => onSalirDelCampo(campo)}
      />
      {error !== undefined && (
        <p id={idMensaje} role="alert" className="text-auxiliar font-medium text-peligro">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Los tres datos de un deudor: nombre y apellido, DNI y telefono. Se usa igual para el alta y
 * para la edicion. Los errores de cada campo los decide el hook; aca solo se muestran.
 */
export function FormularioDeudor({
  idFormulario,
  valores,
  errores,
  deshabilitado,
  onCambiarValor,
  onSalirDelCampo,
  onEnviar,
}: FormularioDeudorProps) {
  const enviarFormulario = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    onEnviar()
  }

  const propiedadesComunes = { idFormulario, deshabilitado, onCambiarValor, onSalirDelCampo }

  return (
    // noValidate: los mensajes los da el hook, no el navegador
    <form id={idFormulario} noValidate className="flex flex-col gap-bloque" onSubmit={enviarFormulario}>
      <CampoDatoDeudor
        {...propiedadesComunes}
        campo="nombreCompleto"
        etiqueta="Nombre y apellido"
        tipo="text"
        modoEntrada="text"
        autoEnfocar
        valor={valores.nombreCompleto}
        error={errores.nombreCompleto}
      />
      <CampoDatoDeudor
        {...propiedadesComunes}
        campo="dni"
        etiqueta="DNI"
        tipo="text"
        modoEntrada="numeric"
        valor={valores.dni}
        error={errores.dni}
      />
      <CampoDatoDeudor
        {...propiedadesComunes}
        campo="telefono"
        etiqueta="Teléfono"
        tipo="tel"
        modoEntrada="tel"
        valor={valores.telefono}
        error={errores.telefono}
      />
    </form>
  )
}
