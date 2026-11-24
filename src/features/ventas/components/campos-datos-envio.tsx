import { useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ErroresDatosEnvio } from '@/features/ventas/types/venta'

const ID_CAMPO_DIRECCION = 'campo-direccion-envio'
const ID_CAMPO_DESTINATARIO = 'campo-destinatario-envio'

/** Props de los campos del envio. */
interface CamposDatosEnvioProps {
  direccionEnvio: string
  destinatarioEnvio: string
  errores: ErroresDatosEnvio
  /** Sube con cada intento fallido de confirmar: el foco va al primer campo con error. */
  intentosFallidos: number
  deshabilitado: boolean
  onCambiarDireccionEnvio: (direccionEnvio: string) => void
  onCambiarDestinatarioEnvio: (destinatarioEnvio: string) => void
}

/** Props de un campo de texto con su etiqueta y, si hace falta, su error. */
interface CampoTextoEnvioProps {
  id: string
  etiqueta: string
  valor: string
  error?: string
  deshabilitado: boolean
  onCambiar: (valor: string) => void
}

/** Un campo con su etiqueta; el error se anuncia al marcarse y queda unido al campo para los lectores de pantalla. */
function CampoTextoEnvio({ id, etiqueta, valor, error, deshabilitado, onCambiar }: CampoTextoEnvioProps) {
  const idError = `${id}-error`

  return (
    <div className="flex flex-1 flex-col gap-interno">
      <Label htmlFor={id} className="text-cuerpo font-medium">
        {etiqueta}
      </Label>
      <Input
        id={id}
        type="text"
        autoComplete="off"
        disabled={deshabilitado}
        value={valor}
        aria-invalid={error !== undefined}
        aria-describedby={error !== undefined ? idError : undefined}
        className="bg-fondo-tarjeta"
        onChange={(evento) => onCambiar(evento.target.value)}
      />
      {error !== undefined && (
        <p id={idError} role="alert" className="text-auxiliar font-medium text-peligro">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Direccion y destinatario del envio. Solo se muestran con la entrega en Envio: con Retiro el back no los admite.
 * La direccion es obligatoria; el destinatario es opcional (no siempre se sabe quien recibe).
 */
export function CamposDatosEnvio({
  direccionEnvio,
  destinatarioEnvio,
  errores,
  intentosFallidos,
  deshabilitado,
  onCambiarDireccionEnvio,
  onCambiarDestinatarioEnvio,
}: CamposDatosEnvioProps) {
  // Los errores vigentes, para leerlos al fallar un intento sin que cada tecla vuelva a mover el foco
  const erroresRef = useRef(errores)
  useEffect(() => {
    erroresRef.current = errores
  })

  // Al fallar la confirmacion, el foco y el desplazamiento van al primer campo con error: el boton de confirmar
  // queda lejos de este bloque, sobre todo en celular, y sin esto el error pasaria desapercibido
  useEffect(() => {
    if (intentosFallidos === 0) return
    const idCampo =
      erroresRef.current.direccionEnvio !== undefined
        ? ID_CAMPO_DIRECCION
        : erroresRef.current.destinatarioEnvio !== undefined
          ? ID_CAMPO_DESTINATARIO
          : null
    const campo = idCampo === null ? null : document.getElementById(idCampo)
    if (campo === null) return
    campo.focus({ preventScroll: true })
    campo.scrollIntoView({ block: 'center' })
  }, [intentosFallidos])

  return (
    <div className="flex flex-col gap-bloque md:flex-row">
      <CampoTextoEnvio
        id={ID_CAMPO_DIRECCION}
        etiqueta="Dirección de envío"
        valor={direccionEnvio}
        error={errores.direccionEnvio}
        deshabilitado={deshabilitado}
        onCambiar={onCambiarDireccionEnvio}
      />
      <CampoTextoEnvio
        id={ID_CAMPO_DESTINATARIO}
        etiqueta="Destinatario (opcional)"
        valor={destinatarioEnvio}
        error={errores.destinatarioEnvio}
        deshabilitado={deshabilitado}
        onCambiar={onCambiarDestinatarioEnvio}
      />
    </div>
  )
}
