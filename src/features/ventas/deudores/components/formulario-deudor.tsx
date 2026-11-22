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
  ayuda: string
  valor: string
  error?: string
  deshabilitado: boolean
  modoEntrada: 'text' | 'tel' | 'numeric'
  tipo: 'text' | 'tel'
  autoEnfocar?: boolean
  onCambiarValor: (campo: CampoDeudor, valor: string) => void
  onSalirDelCampo: (campo: CampoDeudor) => void
}

/** Un campo con su etiqueta, su ayuda y su error. El error reemplaza a la ayuda y se anuncia al marcarse. */
function CampoDatoDeudor({
  idFormulario,
  campo,
  etiqueta,
  ayuda,
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
        aria-describedby={idMensaje}
        className="bg-fondo-tarjeta"
        onChange={(evento) => onCambiarValor(campo, evento.target.value)}
        onBlur={() => onSalirDelCampo(campo)}
      />
      {error !== undefined ? (
        <p id={idMensaje} role="alert" className="text-auxiliar font-medium text-peligro">
          {error}
        </p>
      ) : (
        <p id={idMensaje} className="text-auxiliar text-texto-suave">
          {ayuda}
        </p>
      )}
    </div>
  )
}

/**
 * Los tres datos de un deudor: nombre y apellido, telefono con codigo de pais y DNI. Se usa igual para el alta y
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
        ayuda="Hasta 100 caracteres"
        tipo="text"
        modoEntrada="text"
        autoEnfocar
        valor={valores.nombreCompleto}
        error={errores.nombreCompleto}
      />
      <CampoDatoDeudor
        {...propiedadesComunes}
        campo="telefono"
        etiqueta="Teléfono"
        ayuda="Con código de país. Por ejemplo: +54 9 11 2345-6789"
        tipo="tel"
        modoEntrada="tel"
        valor={valores.telefono}
        error={errores.telefono}
      />
      <CampoDatoDeudor
        {...propiedadesComunes}
        campo="dni"
        etiqueta="DNI"
        ayuda="7 u 8 números, sin puntos"
        tipo="text"
        modoEntrada="numeric"
        valor={valores.dni}
        error={errores.dni}
      />
    </form>
  )
}
